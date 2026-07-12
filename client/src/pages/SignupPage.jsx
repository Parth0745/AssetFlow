import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await signup(values);
    navigate("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold">Employee Signup</h1>
        <input {...register("firstName")} placeholder="First name" className="w-full rounded-lg border p-2" />
        <input {...register("lastName")} placeholder="Last name" className="w-full rounded-lg border p-2" />
        <input {...register("email")} placeholder="Email" className="w-full rounded-lg border p-2" />
        <input type="password" {...register("password")} placeholder="Password" className="w-full rounded-lg border p-2" />
        {(errors.firstName || errors.lastName || errors.email || errors.password) && <p className="text-xs text-rose-500">Please complete all fields correctly.</p>}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          {isSubmitting ? "Creating..." : "Create Employee Account"}
        </button>
        <p className="text-sm">Already registered? <Link to="/login" className="text-brand-600">Login</Link></p>
      </form>
    </div>
  );
}
