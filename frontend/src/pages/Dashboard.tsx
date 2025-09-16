import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Modal from '../components/Modal';
import { useModal } from '../hooks/useModal';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
    const { theme } = useTheme();
    const modal = useModal();

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto"
        >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
            
            {/* Example buttons to demonstrate modal usage */}
            <div className="mb-6 space-x-4">
                <button
                    onClick={modal.open}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Open Modal
                </button>
                <button
                    onClick={() => modal.open()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Open Large Modal
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-xl text-gray-600 dark:text-gray-400">Coming soon</p>
            </div>

            {/* Modal Examples */}
            <Modal
                isOpen={modal.isOpen}
                onClose={modal.close}
                title="Example Modal"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        This is an example of the modal component. You can put any content here!
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={modal.close}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={modal.close}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default Dashboard;
