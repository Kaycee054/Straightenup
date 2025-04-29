import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { validatePassword, validateEmail, checkRateLimit } from '../lib/security';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });
  const navigate = useNavigate();
  const { signup, updateProfile } = useAuthStore();

  useEffect(() => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Email validation
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      setErrors(emailErrors);
      return;
    }

    // Password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      setErrors(['Too many registration attempts. Please try again later.']);
      return;
    }

    setIsLoading(true);

    try {
      await signup(email.trim(), password);
      if (fullName) {
        await updateProfile({ full_name: fullName });
      }
      navigate('/store');
    } catch (err: any) {
      if (err.message?.includes('email_address_invalid')) {
        setErrors(['Please enter a valid email address']);
      } else if (err.message?.includes('already registered')) {
        setErrors(['This email is already registered']);
      } else {
        setErrors(['Failed to create account. Please try again.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrength = () => (
    <div className="space-y-2 text-sm">
      <h4 className="font-medium text-gray-300">Password Requirements:</h4>
      <ul className="space-y-1">
        {[
          { check: passwordStrength.hasMinLength, label: 'At least 8 characters' },
          { check: passwordStrength.hasUppercase, label: 'One uppercase letter' },
          { check: passwordStrength.hasLowercase, label: 'One lowercase letter' },
          { check: passwordStrength.hasNumber, label: 'One number' },
          { check: passwordStrength.hasSpecial, label: 'One special character' }
        ].map(({ check, label }) => (
          <li key={label} className="flex items-center space-x-2">
            {check ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={check ? 'text-green-500' : 'text-red-500'}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-2xl backdrop-blur-xl border border-purple-500/20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm border border-red-500/20">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {renderPasswordStrength()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !Object.values(passwordStrength).every(Boolean) || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-sm text-gray-400 text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-purple-400 hover:text-purple-300"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;