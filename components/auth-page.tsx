"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Lock, Eye, EyeOff } from "lucide-react"
import Cookies from 'js-cookie'
import { authUtils } from "@/lib/auth"

interface AuthPageProps {
  onAuthenticated: () => void
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [code, setCode] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (authUtils.validateAccessCode(code)) {
      authUtils.setAuthenticated()
      onAuthenticated()
    } else {
      setError("Invalid access code. Please try again.")
      setCode("")
    }

    setLoading(false)
  }

  const handleNiksLogyClick = () => {
    window.open('mailto:nikitpotdar@gmail.com', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
              FynAI Option Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Access Restricted Application
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-lg">
              <Lock className="w-5 h-5" />
              Enter Access Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-sm font-medium">
                  Access Code
                </Label>
                <div className="relative">
                  <Input
                    id="access-code"
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your access code"
                    className="pr-10 h-12 text-center text-lg font-mono tracking-wider"
                    autoComplete="off"
                    autoFocus
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => setShowCode(!showCode)}
                    disabled={loading}
                  >
                    {showCode ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Access Application"
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Secure Access Required
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  This application requires authentication for security purposes.
                </p>
                <p className="text-xs text-muted-foreground">
                  Session will remain active for 2 hours after successful login.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            by{" "}
            <button
              onClick={handleNiksLogyClick}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors cursor-pointer font-medium"
            >
              NiksLogy
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
