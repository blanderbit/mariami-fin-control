import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-lg"
            >
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2
                    }}
                    className="text-9xl font-bold text-primary-300 dark:text-primary-800"
                >
                    404
                </motion.div>

                <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>

                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
                </p>

                <Link
                    to="/"
                    className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <Home size={18} className="mr-2" />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}

export default NotFound;
