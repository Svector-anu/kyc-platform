'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    Shield,
    Calendar,
    User,
    Mail,
    Hash,
    Copy,
    Download,
    Eye,
    EyeOff
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

const CredentialViewer = ({ proof, onClose, className = "" }) => {
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!proof) return null;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const downloadCredential = () => {
        const dataStr = JSON.stringify(proof, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `kyc-credential-${proof.id}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const getCredentialStatus = () => {
        if (proof.status === 'approved') {
            return { color: 'green', text: 'Verified & Approved', icon: CheckCircle2 };
        } else if (proof.status === 'rejected') {
            return { color: 'red', text: 'Rejected', icon: CheckCircle2 };
        } else {
            return { color: 'yellow', text: 'Pending Verification', icon: CheckCircle2 };
        }
    };

    const status = getCredentialStatus();
    const StatusIcon = status.icon;

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Digital Credential</CardTitle>
                                    <p className="text-blue-100 text-sm">Zero-Knowledge Age Verification</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-white hover:bg-white hover:bg-opacity-20"
                            >
                                ✕
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
                        {/* Status Badge */}
                        <motion.div
                            className="mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${status.color}-50 border border-${status.color}-200`}>
                                <StatusIcon className={`w-5 h-5 text-${status.color}-600`} />
                                <span className={`font-semibold text-${status.color}-700`}>
                                    {status.text}
                                </span>
                            </div>
                        </motion.div>

                        {/* Credential Details */}
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">Name:</span>
                                            <span>{proof.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">Email:</span>
                                            <span>{proof.email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">Generated:</span>
                                            <span>{formatDate(new Date(proof.timestamp).getTime())}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Hash className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">ID:</span>
                                            <span className="font-mono text-xs">{proof.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Verification Details */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    Verification Details
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Age Verification:</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                ✅ Verified (18+)
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Proof Type:</span>
                                            <span className="text-sm font-mono">Age ≥ 18 Verification</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Algorithm:</span>
                                            <span className="text-sm">Zero-Knowledge Proof</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Technical Details */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-purple-600" />
                                        Technical Details
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSensitiveData(!showSensitiveData)}
                                    >
                                        {showSensitiveData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                        {showSensitiveData ? 'Hide' : 'Show'} Data
                                    </Button>
                                </div>

                                {showSensitiveData && proof.proofData && (
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Proof Data:</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(JSON.stringify(proof.proofData, null, 2))}
                                                >
                                                    <Copy className="w-4 h-4 mr-1" />
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={downloadCredential}
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                        <pre className="text-xs font-mono overflow-auto max-h-40 text-gray-700 bg-white p-3 rounded border">
                                            {JSON.stringify(proof.proofData, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {!showSensitiveData && (
                                    <div className="bg-gray-50 border rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            🔒 Sensitive proof data is hidden for security
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click "Show Data" to view technical details
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </CardContent>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CredentialViewer;
