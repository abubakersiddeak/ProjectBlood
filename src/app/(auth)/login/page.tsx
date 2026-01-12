"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, Heart } from "lucide-react";
import FormInput from "@/components/FormInput";
import server from "@/lib/api";
import Swal from "sweetalert2";
import { AxiosError } from "axios";

// 1. Define the shape of your form fields
interface LoginFormInput {
  email: string;
  password: string;
}

// 2. Define the shape of your API error response (optional but helpful)
interface ApiError {
  message?: string;
}

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInput>({
    // Pass the interface here
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // 3. Define the submit handler type
  const onSubmit: SubmitHandler<LoginFormInput> = useCallback(
    async (data) => {
      try {
        setLoading(true);

        Swal.fire({
          title: "Logging in...",
          text: "Please wait while we verify your credentials",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const loginData = {
          email: data.email,
          password: data.password,
          rememberMe: rememberMe,
        };

        // API call
        const res = await server.post("api/auth/login", loginData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        reset();
        setShowPassword(false);

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          html: `
            <p class="text-gray-600">Welcome back to our blood donation community!</p>
            <p class="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
          `,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            window.location.href = "/";
          },
        });
      } catch (error) {
        // 4. Properly type the error catch block
        const err = error as AxiosError<ApiError>;
        console.error("Login Error:", err);

        let errorMessage = "Gmail or Password not valid.";
        let errorTitle = "Login Failed";

        if (err.response) {
          if (err.response.status === 401) {
            errorTitle = "Invalid Credentials";
            errorMessage = "The email or password you entered is incorrect.";
          } else if (err.response.status === 404) {
            errorTitle = "Account Not Found";
            errorMessage = "No account found with this email address.";
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.request) {
          errorTitle = "Connection Error";
          errorMessage =
            "Unable to connect to the server. Please check your internet connection.";
        }

        Swal.fire({
          icon: "error",
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: "#dc2626",
          footer:
            '<a href="/registerDonor" class="text-red-600 hover:underline">Don\'t have an account? Register here</a>',
        });
      } finally {
        setLoading(false);
      }
    },
    [reset, rememberMe]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-22">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 mb-3">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 text-sm mt-1">
                Login to your donor account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5">
              <div className="space-y-4">
                <FormInput
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  error={errors.email}
                  register={register}
                  type="email"
                  placeholder="Enter your email"
                  validation={{
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  }}
                />

                <div className="md:col-span-2">
                  <FormInput
                    id="password"
                    label="Password"
                    icon={Lock}
                    error={errors.password}
                    register={register}
                    placeholder="Enter your password"
                    validation={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    }}
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={togglePassword}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2.5 px-4 font-medium hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/registerDonor"
                    className="text-red-600 font-medium hover:underline cursor-pointer"
                  >
                    Register here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
