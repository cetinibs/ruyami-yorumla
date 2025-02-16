import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { MoonIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Stats {
  dreams: number;
  users: number;
}

export default function DreamForm({ stats }: { stats: Stats }) {
  const { t } = useTranslation('common');
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInterpretation('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rüya yorumlanırken bir hata oluştu');
      }

      const data = await response.json();
      setInterpretation(data.interpretation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rüya yorumlanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto pt-20"
      >
        <h1 className="text-4xl font-serif text-center mb-2">{t('title')}</h1>
        <p className="text-center text-gray-300 mb-8">{t('subtitle')}</p>

        {/* Stats Display */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="flex items-center gap-2">
            <MoonIcon className="h-6 w-6 text-pink-400" />
            <div>
              <div className="text-2xl font-bold">{stats.dreams}</div>
              <div className="text-sm text-gray-300">{t('stats.dreams')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{stats.users}</div>
              <div className="text-sm text-gray-300">{t('stats.users')}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full h-40 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
            disabled={isLoading}
          />
          
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {interpretation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-200"
            >
              {interpretation}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading || dream.length < 3}
          >
            {isLoading ? t('loading') : t('button')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
