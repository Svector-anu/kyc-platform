'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProof } from '@/hooks/useProof';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, ArrowLeft, User, Mail, Calendar, Shield } from 'lucide-react';
import StepIndicator from './StepIndicator';

const EnhancedKYCForm = () => {
    const { isConnected, address, connectWallet, disconnect, isConnecting } = useWallet();
    const { generateProof, isGenerating, currentProof } = useProof();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        email: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [age, setAge] = useState(null);

    const steps = [
        {
            id: 1,
            title: 'Personal Information',
            description: 'Enter your basic details for verification',
            icon: User
        },
        {
            id: 2,
            title: 'Wallet Connection',
            description: 'Connect your MetaMask wallet',
            icon: Shield
        },
        {
            id: 3,
            title: 'Generate Proof',
            description: 'Create your zero-knowledge proof',
            icon: CheckCircle2
        },
        {
            id: 4,
            title: 'Complete',
            description: 'Your proof has been generated successfully',
            icon: CheckCircle2
        }
    ];

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

    const validateStep1 = () => {
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

    const handleNext = async () => {
        setError('');

        if (currentStep === 1) {
            if (!validateStep1()) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!isConnected) {
                setError('Please connect your wallet to continue');
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            await handleGenerateProof();
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    const handleGenerateProof = async () => {
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
            setCurrentStep(4);

            // Save to localStorage for dashboard
            const existingProofs = JSON.parse(localStorage.getItem('kycProofs') || '[]');
            const newProof = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                name: formData.name,
                email: formData.email,
                ageVerified: true,
                status: 'pending',
                proofData: generatedProof,
            };

            console.log('Saving proof to localStorage:', newProof);
            localStorage.setItem('kycProofs', JSON.stringify([...existingProofs, newProof]));

        } catch (err) {
            setError(err.message || 'Failed to generate proof');
            console.error('Proof generation error:', err);
        }
    };

    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600 mt-2">Enter your details for age verification</p>
            </div>

            <div className="space-y-4">
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
                        className="w-full"
                    />
                </div>

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
                        className="w-full"
                    />
                    {age !== null && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-muted-foreground"
                        >
                            {age >= 18 ? (
                                <span className="text-green-600 font-medium">✓ Age: {age} years old (Eligible)</span>
                            ) : (
                                <span className="text-red-600 font-medium">✗ Age: {age} years old (Must be 18+)</span>
                            )}
                        </motion.p>
                    )}
                </div>

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
                        className="w-full"
                    />
                </div>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Wallet Connection</h2>
                <p className="text-gray-600 mt-2">Connect your MetaMask wallet to continue</p>
            </div>

            <div className="flex justify-center">
                {!isConnected ? (
                    <Button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        size="lg"
                        className="px-8 py-4"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                🦊 Connect MetaMask
                            </>
                        )}
                    </Button>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Wallet Connected!</h3>
                            <p className="text-sm text-green-600 mb-2">
                                Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                            <Button
                                variant="outline"
                                onClick={disconnect}
                                size="sm"
                            >
                                Disconnect
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Generate Proof</h2>
                <p className="text-gray-600 mt-2">Create your zero-knowledge age verification proof</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Proof Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-blue-700">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Age:</span>
                        <span className="font-medium">{age} years old</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Wallet:</span>
                        <span className="font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Verification:</span>
                        <span className="font-medium text-green-600">Age ≥ 18 ✓</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    🔒 <strong>Privacy Notice:</strong> Your date of birth will NOT be shared.
                    Only a cryptographic proof that you are 18+ will be generated.
                </p>
            </div>
        </motion.div>
    );

    const renderStep4 = () => (
        <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900">Proof Generated Successfully!</h2>
            <p className="text-gray-600">
                Your zero-knowledge age verification proof has been created and saved.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-4">Proof Details</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-green-700">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-green-700">Status:</span>
                        <span className="font-medium text-green-600">Ready for Verification</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-green-700">Type:</span>
                        <span className="font-medium">Age ≥ 18 Verification</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6"
                >
                    View Dashboard
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        setFormData({ name: '', dob: '', email: '' });
                        setAge(null);
                        setCurrentStep(1);
                        setSuccess(false);
                    }}
                >
                    Create Another
                </Button>
            </div>
        </motion.div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return renderStep1();
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Submit KYC Information</CardTitle>
                <CardDescription className="text-center">
                    Complete the multi-step process to generate your zero-knowledge proof
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Step Indicator */}
                <StepIndicator
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={(step) => {
                        if (step <= currentStep) {
                            setCurrentStep(step);
                        }
                    }}
                />

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Step Content */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {renderCurrentStep()}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                {currentStep < 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between mt-8"
                    >
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={
                                (currentStep === 1 && (!formData.name || !formData.dob || !formData.email)) ||
                                (currentStep === 2 && !isConnected) ||
                                (currentStep === 3 && isGenerating)
                            }
                            className="px-8"
                        >
                            {currentStep === 3 ? (
                                isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Proof'
                                )
                            ) : (
                                <>
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
};

export default EnhancedKYCForm;
