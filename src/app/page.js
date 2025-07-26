'use client'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

const api = process.env.NEXT_PUBLIC_API_URL

export default function Home() {
  const [adminid, setAdminid] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!adminid || !password) {
      toast.warning("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${api}/admin`, {
        adminid,
        password,
      })

      console.log(res)

      if (res.data.success) {
        toast.success("Login successful")

        const accessToken = res.data.tokens.accessToken
        const refreshToken = res.data.tokens.refreshToken

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax;`;

        // Set refreshToken cookie for 7 days with domain sharing
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax;`;

        // Redirect after storing tokens
        router.push('/dashboard')
      }
      else {
        toast.error(res.data.message || "Login failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Input
            placeholder="Admin ID"
            value={adminid}
            onChange={(e) => setAdminid(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
