'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, Send, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ProofCard = ({
    proof,
    onVerify,
    onView,
    onDelete,
    isVerifying = false,
    className = ""
}) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✅ Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⏳ Pending
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        ❌ Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Unknown
                    </Badge>
                );
        }
    };

    return (
        <motion.div
            className={`${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        {/* Main Content */}
                        <div className="space-y-3 flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(proof.status)}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {proof.name}
                                    </h3>
                                </div>
                                {getStatusBadge(proof.status)}
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">📧 Email:</span>
                                    <span>{proof.email}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-medium">🔐 Proof Type:</span>
                                    <span className="font-semibold text-blue-600">Age ≥ 18 Verification</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-medium">📅 Generated:</span>
                                    <span>{formatDate(new Date(proof.timestamp).getTime())}</span>
                                </div>

                                {proof.ageVerified && (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Age Verified (18+)</span>
                                    </div>
                                )}

                                {/* Verification Result */}
                                {proof.verificationResult && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-sm">Verification Result:</span>
                                            {proof.verificationResult.decision === 'approved' ? (
                                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {proof.verificationResult.reason}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Verified by: {proof.verificationResult.verifiedBy || 'KYC Platform'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Proof Data Preview */}
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    🔍 View Proof Data
                                </summary>
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                                    <pre className="text-xs font-mono overflow-auto max-h-40 text-gray-700">
                                        {JSON.stringify(proof.proofData, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            <Button
                                size="sm"
                                onClick={() => onVerify(proof)}
                                disabled={proof.status === 'approved' || isVerifying}
                                className="w-full"
                            >
                                {isVerifying ? (
                                    <>
                                        <motion.div
                                            className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Verify
                                    </>
                                )}
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onView(proof)}
                                className="w-full"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                            </Button>

                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(proof.id)}
                                className="w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProofCard;
