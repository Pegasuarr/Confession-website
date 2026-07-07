import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  Layers,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

const createLinkSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  expiresAt: z.string().optional(),
  multipleResponses: z.boolean().default(true),
});

type CreateLinkFormInputs = z.infer<typeof createLinkSchema>;

export const CreateLink: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createdLink, setCreatedLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const getMinDatetime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLinkFormInputs>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      multipleResponses: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateLinkFormInputs) => {
      // Map empty inputs to null / format date safely
      let formattedDate: string | null = null;
      if (data.expiresAt) {
        const parsed = new Date(data.expiresAt);
        if (!isNaN(parsed.getTime())) {
          formattedDate = parsed.toISOString();
        }
      }

      const payload = {
        title: data.title || undefined,
        message: data.message || undefined,
        expiresAt: formattedDate,
        multipleResponses: data.multipleResponses,
      };

      const response = await api.post('/links', payload);
      return response.data.link;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-links'] });
      setCreatedLink(data);
    },
  });

  const onSubmit = (data: CreateLinkFormInputs) => {
    mutation.mutate(data);
  };

  const handleCopy = () => {
    if (!createdLink) return;
    const shareUrl = `${window.location.origin}/c/${createdLink.slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!createdLink) return;
    const svg = document.getElementById('qr-create');
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const imageLink = document.createElement('a');
    imageLink.href = blobURL;
    imageLink.download = `crushlink-qr-${createdLink.slug}.svg`;
    document.body.appendChild(imageLink);
    imageLink.click();
    document.body.removeChild(imageLink);
  };

  const shareUrl = createdLink ? `${window.location.origin}/c/${createdLink.slug}` : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard/links"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create CrushLink</h2>
          <p className="text-gray-500 dark:text-gray-400">Generate a route to ask that special someone anonymously.</p>
        </div>
      </div>

      {createdLink ? (
        /* Success Share Card View */
        <div className="glass-panel p-8 rounded-card border border-white/60 dark:border-white/5 shadow-2xl text-center space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold">Your CrushLink is Ready! 💖</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Copy this link or save the QR code and send it to your crush.
            </p>
          </div>

          <div className="bg-white/40 dark:bg-dark-card/40 p-4 rounded-xl border border-gray-100 dark:border-dark-border flex items-center justify-between gap-4 max-w-md mx-auto">
            <span className="text-sm font-semibold truncate text-gray-700 dark:text-gray-300 break-all text-left flex-1">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="bg-gradient-to-r from-brand-pink to-brand-purple text-white p-2.5 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              {copied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl inline-block border border-gray-100 shadow-sm">
              <QRCodeSVG
                id="qr-create"
                value={shareUrl}
                size={180}
                level="H"
                includeMargin
              />
            </div>
            <div>
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/30 font-semibold py-2.5 px-5 rounded-xl transition"
              >
                <Download className="h-4.5 w-4.5" /> Download QR SVG
              </button>
            </div>
          </div>

          <div className="flex gap-4 max-w-md mx-auto border-t border-gray-100 dark:border-dark-border/40 pt-6">
            <Link
              to="/dashboard/links"
              className="flex-1 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/30 font-semibold py-3.5 rounded-xl transition text-center"
            >
              Manage Links
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 rounded-xl transition text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Create Form View */
        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-6 rounded-card border border-white/60 dark:border-white/5 shadow-premium space-y-6">
          {mutation.isError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-medium text-center">
              {(mutation.error as any)?.response?.data?.message || 'Failed to generate link. Please check your inputs.'}
            </div>
          )}
          {/* Link Title */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Link Title (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. My Crush from Chemistry Class"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
              />
            </div>
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.title.message}</p>
            )}
          </div>

          {/* Anonymous message */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Anonymous Message (Optional)
            </label>
            <p className="text-xs text-gray-400 mb-1">This message will be shown to the recipient before voting.</p>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <textarea
                {...register('message')}
                rows={3}
                placeholder="e.g. I've had a crush on you since our library study sessions. Do you feel the same?"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none resize-none"
              />
            </div>
            {errors.message && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.message.message}</p>
            )}
          </div>

          {/* Expiration date */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expiration Date (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                {...register('expiresAt')}
                min={getMinDatetime()}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
              />
            </div>
          </div>

          {/* Multiple Responses Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white/30 dark:bg-dark-card/30">
            <input
              type="checkbox"
              id="multipleResponses"
              {...register('multipleResponses')}
              className="h-5 w-5 rounded border-gray-300 text-brand-pink focus:ring-brand-pink transition"
            />
            <div>
              <label htmlFor="multipleResponses" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                Allow Multiple Responses
              </label>
              <p className="text-xs text-gray-400">If unchecked, the recipient will only be allowed to submit one vote.</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-75"
          >
            {mutation.isPending ? 'Generating Link...' : 'Generate CrushLink'}
          </button>
        </form>
      )}
    </div>
  );
};
