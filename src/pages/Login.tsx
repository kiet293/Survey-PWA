import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ')
    .refine((v) => v.endsWith('@vku.udn.vn'), 'Email phải có định dạng @vku.udn.vn'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    const result = await login(data.email, data.password)
    if (result.success) {
      navigate('/')
    } else {
      setServerError(result.error ?? 'Đăng nhập thất bại')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--content-padding)',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '50%', height: '40%',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="animate-slide-up"
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontWeight: 900,
              fontSize: 22,
              color: 'white',
              letterSpacing: '-1.5px',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
            }}
          >
            VKU
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
            VKU Field Survey
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Đăng nhập để bắt đầu khảo sát cơ sở vật chất
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card glass-card--elevated" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email VKU</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="ten.cua.ban@vku.udn.vn"
                    style={{ paddingLeft: 42 }}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="form-error">
                    <AlertCircle size={12} /> {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                    placeholder="Mật khẩu của bạn"
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4,
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">
                    <AlertCircle size={12} /> {errors.password.message}
                  </span>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    background: 'var(--color-danger-bg)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-danger)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <AlertCircle size={14} />
                  {serverError}
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="btn btn--primary btn--full btn--lg"
                style={{ marginTop: 4 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info note */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 20, lineHeight: 1.6 }}>
          Sử dụng email VKU (@vku.udn.vn) để đăng nhập<br/>
          Ứng dụng hoạt động hoàn toàn offline
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
