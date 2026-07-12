import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), defaultValues: { rememberMe: true } });

  const onSubmit = async (values) => {
    await login(values);
    navigate("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold">AssetFlow Login</h1>
        <input {...register("email")} placeholder="Email" className="w-full rounded-lg border p-2" />
        {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        <input type="password" {...register("password")} placeholder="Password" className="w-full rounded-lg border p-2" />
        {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("rememberMe")} /> Remember me
        </label>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/signup" className="text-brand-600">Create account</Link>
          <Link to="/forgot-password" className="text-brand-600">Forgot password</Link>
        </div>
      </form>
    </div>
  );
}
