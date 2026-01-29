"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import { toast } from "react-toastify"
import Image from "next/image"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"

import "react-toastify/dist/ReactToastify.css"

export default function VerifyTokenClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "verified" | "expired">(
    "loading"
  )

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("expired")
      return
    }

    const verifyAccount = async () => {
      try {
        const response = await fetch(
          `https://stock-backend-4.onrender.com/api/v1/users/verify?token=${token}`,
          { method: "PATCH" }
        )

        if (!response.ok) throw new Error("Verification failed")

        const data = await response.json()
        setStatus("verified")

        toast.success(data.message, {
          autoClose: 3000,
          hideProgressBar: true,
          position: "top-right",
        })

        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } catch {
        setStatus("expired")
        toast.error("Verification link expired", {
          autoClose: 3000,
          hideProgressBar: true,
          position: "top-right",
        })
      }
    }

    verifyAccount()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center flex-col justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8 w-full max-w-md">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2">
            <p>Verifying your account</p>
            <CircularProgress />
            <Image src="/images/logo.png" alt="Logo" width={200} height={100} />
          </div>
        )}

        {status === "verified" && (
          <div className="flex flex-col items-center">
            <CheckCircleOutlineIcon
              sx={{ fontSize: 100, color: "success.main" }}
            />
            <Typography variant="h5" color="success.main">
              Account Verified
            </Typography>
          </div>
        )}

        {status === "expired" && (
          <Typography variant="h5" color="error.main" className="text-center">
            Token Expired
          </Typography>
        )}
      </div>
    </div>
  )
}
