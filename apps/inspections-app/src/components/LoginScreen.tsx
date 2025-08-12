import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, ArrowLeft, FileCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (phoneNumber: string) => void;
}

type LoginStep = 'phone' | 'otp';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Extract digits only
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to send OTP
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('otp');
      startResendCooldown();
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to verify OTP
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      // In production, this would verify against the backend
      onLogin(phoneNumber);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      startResendCooldown();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <FileCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SafetyCheck</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Professional inspection and work order management
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {step === 'phone' ? (
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
              ) : (
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">
              {step === 'phone' ? 'Sign In' : 'Verify Your Phone'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your mobile number to get started'
                : `We sent a 6-digit code to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="text-lg"
                    maxLength={14}
                    autoComplete="tel"
                    autoFocus
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || phoneNumber.replace(/\D/g, '').length !== 10}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={handleOtpChange}
                    className="text-lg text-center tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToPhone}
                    className="flex items-center gap-2 p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change Number
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className="p-0 h-auto"
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'
                    }
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>Secure authentication powered by SMS verification</p>
        </div>
      </div>
    </div>
  );
}