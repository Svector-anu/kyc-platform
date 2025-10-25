'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = onStepClick && stepNumber <= currentStep;

                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step Circle */}
                            <motion.div
                                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-gray-100 border-gray-300 text-gray-400'
                                    }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                onClick={isClickable ? () => onStepClick(stepNumber) : undefined}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{stepNumber}</span>
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <motion.div
                                className="ml-3 min-w-0 flex-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                            >
                                <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                )}
                            </motion.div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <motion.div
                                    className="flex-1 h-0.5 mx-4 bg-gray-200"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                >
                                    <motion.div
                                        className="h-full bg-blue-500 origin-left"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: stepNumber < currentStep ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <motion.div
                className="mt-4 w-full bg-gray-200 rounded-full h-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Current Step Description */}
            {steps[currentStep - 1]?.description && (
                <motion.div
                    className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <p className="text-sm text-blue-800">
                        {steps[currentStep - 1].description}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default StepIndicator;
