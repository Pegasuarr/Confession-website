import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  QrCode,
  Trash2,
  Calendar,
  Layers,
  Heart,
  Eye,
  MessageSquareCode,
  Download,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Links: React.FC = () => {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);

  // Fetch Links
  const { data, isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: async () => {
      const response = await api.get('/links');
      return response.data.links;
    },
  });

  const links = data || [];

  // Delete Link Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      setDeleteId(null);
    },
  });

  const handleCopy = (slug: string, id: string) => {
    const shareUrl = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = (slug: string) => {
    const svg = document.getElementById(`qr-${slug}`);
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const imageLink = document.createElement('a');
    imageLink.href = blobURL;
    imageLink.download = `crushlink-qr-${slug}.svg`;
    document.body.appendChild(imageLink);
    imageLink.click();
    document.body.removeChild(imageLink);
  };

  const toggleExpandLink = (linkId: string) => {
    setExpandedLinkId(expandedLinkId === linkId ? null : linkId);
  };

  const isLinkExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 skeleton-shimmer rounded-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-display">My CrushLinks</h2>
          <p className="text-gray-500 dark:text-gray-400">Create, monitor, and delete your shared confession routes.</p>
        </div>
        <Link
          to="/dashboard/create"
          className="bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold px-5 py-3 rounded-xl transition shadow-sm"
        >
          Create Link
        </Link>
      </div>

      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link: any) => {
            const expired = isLinkExpired(link.expiresAt);
            const shareUrl = `${window.location.origin}/c/${link.slug}`;
            const totalResponses = link.responses?.length || 0;
            const yesCount = link.responses?.filter((r: any) => r.answer === 'YES').length || 0;
            const noCount = link.responses?.filter((r: any) => r.answer === 'NO').length || 0;
            const isExpanded = expandedLinkId === link.id;

            return (
              <motion.div
                key={link.id}
                layout
                className="glass-panel rounded-card shadow-premium border border-gray-100 dark:border-dark-border overflow-hidden"
              >
                {/* Link Header Summary */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold truncate max-w-[280px]">
                        {link.title || 'Untitled CrushLink'}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                        expired
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                      {!link.multipleResponses && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-500/10 text-blue-500 uppercase tracking-wider">
                          One response max
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all select-all flex items-center gap-1">
                      {shareUrl}
                      <a href={shareUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-pink">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </p>
                    {link.message && (
                      <p className="text-xs text-gray-400 font-medium italic mt-1 truncate max-w-[400px]">
                        "{link.message}"
                      </p>
                    )}
                  </div>

                  {/* Metrics Badge */}
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Eye className="h-4 w-4 text-amber-500" />
                      <span>{link.visits} opens</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Heart className="h-4 w-4 text-brand-pink fill-brand-pink" />
                      <span>{yesCount} / {totalResponses} Yes</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(link.slug, link.id)}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/50 transition relative"
                        title="Copy Share Link"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={() => setQrSlug(link.slug)}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/50 transition"
                        title="View QR Code"
                      >
                        <QrCode className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>

                      <button
                        onClick={() => setDeleteId(link.id)}
                        className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleExpandLink(link.id)}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/50 transition flex items-center justify-center"
                        title="Show Details"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded responses grid */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/30 overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-xs font-semibold uppercase text-gray-400 tracking-wider">
                          <span>Responses List ({totalResponses})</span>
                          {link.expiresAt && (
                            <span className="flex items-center gap-1 normal-case font-medium">
                              <Calendar className="h-3.5 w-3.5" /> Expires: {new Date(link.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {totalResponses > 0 ? (
                          <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1">
                            {link.responses.map((resp: any) => (
                              <div
                                key={resp.id}
                                className="flex justify-between items-center p-3 rounded-xl bg-white/70 dark:bg-dark-card/70 border border-gray-100 dark:border-dark-border"
                              >
                                <span className="flex items-center gap-2 font-bold text-sm">
                                  {resp.answer === 'YES' ? (
                                    <>
                                      <Heart className="h-4 w-4 text-brand-pink fill-brand-pink" />
                                      <span className="text-brand-pink">YES! They like you! 😍</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>💔</span>
                                      <span className="text-gray-500">NO. Wants to stay friends. 🥺</span>
                                    </>
                                  )}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(resp.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No answers recorded on this link yet.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="glass-panel rounded-card p-12 text-center shadow-premium border border-gray-100 dark:border-dark-border">
            <Heart className="h-16 w-16 mx-auto mb-4 text-brand-pink/30 animate-pulse" />
            <h3 className="text-2xl font-bold">No CrushLinks Created Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              Create your very first anonymous link and share it to check if they like you back!
            </p>
            <Link
              to="/dashboard/create"
              className="mt-6 inline-block bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold px-6 py-3 rounded-xl hover:shadow-premium transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrSlug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-dark-card p-6 rounded-card max-w-sm w-full border border-gray-100 dark:border-dark-border shadow-2xl relative"
            >
              <button
                onClick={() => setQrSlug(null)}
                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-6 mt-4">
                <div>
                  <h3 className="text-xl font-bold">Share QR Code</h3>
                  <p className="text-xs text-gray-500 mt-1">Recipient can scan to answer anonymously</p>
                </div>

                <div className="bg-white p-4 rounded-xl inline-block border border-gray-100">
                  <QRCodeSVG
                    id={`qr-${qrSlug}`}
                    value={`${window.location.origin}/c/${qrSlug}`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadQR(qrSlug)}
                    className="flex-1 bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4.5 w-4.5" /> Download SVG
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-dark-card p-6 rounded-card max-w-sm w-full border border-gray-100 dark:border-dark-border shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-red-500">Delete CrushLink?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete this link? This will permanently delete the link and all recorded responses. This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border/40 font-semibold py-3 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
