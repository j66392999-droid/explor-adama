"use client"

import { useEffect, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/shared/hooks/state/useAppSelector"
import { refreshTokenThunk } from "../store/auth.thunks"
import { storage } from "@/shared/services/storage/asyncStorage"
import { useAuth } from "./useAuth"

export const useSession = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, tokens, lastActivity } = useAppSelector((state) => state.auth)
  const { logout } = useAuth()

  const initializeSession = useCallback(async () => {
    try {
      const token = await storage.getToken()
      if (token && !isAuthenticated) {
        // Try to refresh token if we have one
        await dispatch(refreshTokenThunk()).unwrap()
      }
    } catch (error) {
      console.log("[v0] Session initialization failed, user needs to login")
      await logout()
    }
  }, [dispatch, isAuthenticated, logout])

  useEffect(() => {
    if (!isAuthenticated || !tokens) return

    // Set up token refresh interval (refresh 5 minutes before expiry)
    const refreshInterval = (tokens.expiresIn - 300) * 1000
    if (refreshInterval <= 0) {
      // Token expires soon, refresh immediately
      dispatch(refreshTokenThunk())
      return
    }

    const timer = setInterval(() => {
      dispatch(refreshTokenThunk()).catch(() => {
        logout()
      })
    }, refreshInterval)

    return () => clearInterval(timer)
  }, [isAuthenticated, tokens, dispatch, logout])

  useEffect(() => {
    if (!isAuthenticated) return

    const inactivityTimeout = 30 * 60 * 1000 // 30 minutes
    const timeSinceLastActivity = Date.now() - lastActivity

    if (timeSinceLastActivity > inactivityTimeout) {
      logout()
      return
    }

    const timer = setTimeout(() => {
      logout()
    }, inactivityTimeout - timeSinceLastActivity)

    return () => clearTimeout(timer)
  }, [isAuthenticated, lastActivity, logout])

  return {
    initializeSession,
    isSessionValid: isAuthenticated && tokens !== null,
    sessionExpiresIn: tokens?.expiresIn || 0,
  }
}
