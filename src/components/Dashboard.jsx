'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trash2, Send, Loader2, Plus, Filter, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ProofCard from './ProofCard';
import CredentialViewer from './CredentialViewer';

export default function Dashboard() {
    const [proofs, setProofs] = useState([]);
    const [selectedProof, setSelectedProof] = useState(null);
    const [sendingProof, setSendingProof] = useState(false);
    const [viewingCredential, setViewingCredential] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadProofs();
    }, []);

    const loadProofs = () => {
        const savedProofs = JSON.parse(localStorage.getItem('kycProofs') || '[]');
        setProofs(savedProofs);
    };

    const deleteProof = (id) => {
        const updatedProofs = proofs.filter(proof => proof.id !== id);
        setProofs(updatedProofs);
        localStorage.setItem('kycProofs', JSON.stringify(updatedProofs));
    };

    const sendProofToVerifier = async (proof) => {
        setSelectedProof(proof);
        setSendingProof(true);

        try {
            // Call our verification API
            const response = await fetch('http://172.20.10.14:4000/api/verify-proof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proof: proof.proofData,
                    walletAddress: proof.proofData?.walletAddress,
                }),
            });

            const result = await response.json();

            // Update proof status based on API response
            const newStatus = result.decision === 'approved' ? 'approved' : 'rejected';
            const updatedProofs = proofs.map(p =>
                p.id === proof.id ? { ...p, status: newStatus, verificationResult: result } : p
            );

            setProofs(updatedProofs);
            localStorage.setItem('kycProofs', JSON.stringify(updatedProofs));

            alert(result.decision === 'approved'
                ? '✅ Proof verified and approved!'
                : '❌ Proof verification failed: ' + result.reason
            );
        } catch (error) {
            console.error('Error sending proof:', error);
            alert('❌ Failed to send proof: ' + error.message);
        } finally {
            setSendingProof(false);
            setSelectedProof(null);
        }
    };

    const handleViewCredential = (proof) => {
        setViewingCredential(proof);
    };

    const handleCloseCredential = () => {
        setViewingCredential(null);
    };

    // Filter proofs based on search and status
    const filteredProofs = proofs.filter(proof => {
        const matchesSearch = proof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proof.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || proof.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStats = () => {
        const total = proofs.length;
        const approved = proofs.filter(p => p.status === 'approved').length;
        const pending = proofs.filter(p => p.status === 'pending').length;
        const rejected = proofs.filter(p => p.status === 'rejected').length;
        return { total, approved, pending, rejected };
    };

    const stats = getStats();

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✅ Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">❌ Rejected</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (proofs.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                <Card className="border-2 border-dashed border-gray-300">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
                            📊 Proof Dashboard
                        </CardTitle>
                        <CardDescription>
                            View and manage your ZK proofs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
                        >
                            <Plus className="w-12 h-12 text-blue-500" />
                        </motion.div>
                        <Alert className="max-w-md mx-auto">
                            <AlertDescription>
                                No proofs generated yet. Generate your first age verification proof using the KYC form!
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl mx-auto space-y-6"
        >
            {/* Header with Stats */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Proofs</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Approved</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-yellow-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Rejected</p>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-red-200" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search proofs by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Proofs Grid */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <AnimatePresence>
                    {filteredProofs.map((proof, index) => (
                        <motion.div
                            key={proof.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ProofCard
                                proof={proof}
                                onVerify={sendProofToVerifier}
                                onView={handleViewCredential}
                                onDelete={deleteProof}
                                isVerifying={sendingProof && selectedProof?.id === proof.id}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State for Filtered Results */}
            {filteredProofs.length === 0 && proofs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No proofs found</h3>
                    <p className="text-gray-500">
                        Try adjusting your search terms or filter criteria
                    </p>
                </motion.div>
            )}

            {/* Credential Viewer Modal */}
            {viewingCredential && (
                <CredentialViewer
                    proof={viewingCredential}
                    onClose={handleCloseCredential}
                />
            )}
        </motion.div>
    );
}