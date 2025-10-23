'use client';

import { useState } from 'react';
import { useProof } from '@/hooks/useProof';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function KYCForm() {
  const { isConnected, address } = useWallet();
  const { generateProof, isGenerating, currentProof } = useProof();
  
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [age, setAge] = useState(null);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    // Calculate age when DOB changes
    if (name === 'dob' && value) {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
    }
  };

  const validateForm = () => {
    // Check all fields are filled
    if (!formData.name || !formData.dob || !formData.email) {
      setError('Please fill in all fields');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate DOB is a valid date
    const birthDate = new Date(formData.dob);
    if (isNaN(birthDate.getTime())) {
      setError('Please enter a valid date of birth');
      return false;
    }

    // Check if DOB is not in the future
    if (birthDate > new Date()) {
      setError('Date of birth cannot be in the future');
      return false;
    }

    // Calculate and validate age
    const calculatedAge = calculateAge(formData.dob);
    
    if (calculatedAge < 18) {
      setError(`You must be at least 18 years old to proceed. Current age: ${calculatedAge}`);
      return false;
    }

    if (calculatedAge > 120) {
      setError('Please enter a valid date of birth');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
  
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
  
    if (!validateForm()) {
      return;
    }
  
    try {
      const calculatedAge = calculateAge(formData.dob);
      
      const credentials = {
        name: formData.name,
        dob: formData.dob,
        age: calculatedAge,
        email: formData.email,
        address: address,
        isOver18: calculatedAge >= 18,
      };
  
      // Generate proof
      const generatedProof = await generateProof(credentials);
      console.log('Generated proof:', generatedProof);
      
      setSuccess(true);
      
      // Save to localStorage for dashboard
      const existingProofs = JSON.parse(localStorage.getItem('kycProofs') || '[]');
      const newProof = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        name: formData.name,
        email: formData.email,
        ageVerified: true,
        status: 'pending',
        proofData: generatedProof, // ✅ Now saving the actual proof
      };
      
      console.log('Saving proof to localStorage:', newProof);
      localStorage.setItem('kycProofs', JSON.stringify([...existingProofs, newProof]));
      
      // Clear form after successful submission
      setTimeout(() => {
        setFormData({ name: '', dob: '', email: '' });
        setAge(null);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to generate proof');
      console.error('Proof generation error:', err);
    }
  };
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit KYC Information</CardTitle>
        <CardDescription>
          Enter your details to generate a zero-knowledge proof for age verification (18+)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isGenerating}
              required
            />
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              disabled={isGenerating}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {age !== null && (
              <p className="text-sm text-muted-foreground">
                {age >= 18 ? (
                  <span className="text-green-600">✓ Age: {age} years old (Eligible)</span>
                ) : (
                  <span className="text-red-600">✗ Age: {age} years old (Must be 18+)</span>
                )}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isGenerating}
              required
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">✅ Zero-Knowledge Proof Generated Successfully!</p>
                  <p className="text-sm">
                    Your age verification proof has been created without exposing your date of birth.
                  </p>
                  <div className="mt-2 text-xs font-mono bg-green-100 p-2 rounded">
                    Proof Type: Age ≥ 18 Verification
                    <br />
                    Status: Ready to Submit
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 <strong>Privacy Notice:</strong> Your date of birth will NOT be shared. 
              Only a cryptographic proof that you are 18+ will be generated.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isGenerating || !isConnected}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating ZK Proof...
              </>
            ) : (
              'Generate Age Verification Proof'
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-center text-muted-foreground">
              ⚠️ Please connect your wallet to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}