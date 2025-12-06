import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Check, Clipboard } from 'lucide-react';
import { useFormatText } from '../hooks/useText';
import { ErrorAlert, ProcessButton } from '../components/ui';

const sampleInput = [
  '==============================================================================',
  'FICHE DE RÉVISION - TIN503 (Environnement, Technologie et Société)',
  'Synthèse des séances 01 à 11',
  '==============================================================================',
  '',
  '',
  '------------------------------------------------------------------------------',
  "SÉANCE 01 & 02 : INTRO, RÔLE DE L'INGÉNIEUR ET PROGRÈS",
  '------------------------------------------------------------------------------',
  '',
  '1. DÉFINITIONS FONDAMENTALES',
  ' * Technologie : Vient de "Teknê" (art, compétence) + "Logos" (parole, discours). C’est la science des procédés ou l’incorporation de la science à la technique .',
  ' * Postulat d’Haudricourt (1964) : "Parce que les faits techniques sont des faits sociaux, la technologie est une science humaine" .',
  ' * Rationalité : Approche méthodique pour contrôler le sort, on délaisse les explications divines/magiques pour une approche technicienne .',
  ' * Solutionnisme technologique (« Technological fix ») : Posture croyant que la technologie seule est la solution aux problèmes sociaux (ex: ensemencement des nuages) .',
  '',
  "2. LE RÔLE DE L'INGÉNIEUR (Compétence Hybride)",
  " * Définition moderne : Doit résoudre des problèmes en intégrant des connaissances techniques, humaines, sociales et organisationnelles .",
  " * 3 Profils de compétence :",
  " A) Acteur de la créativité sociale : Suscite l'innovation, engagé, ouvert .",
  " B) Professionnel d'influence : Maîtrise les relations, leadership, esprit d'équipe .",
  " C) Médiateur social (Acteur réseau) : Interface entre direction, exécutants et clients .",
  " * L'Expert : Possède une supériorité de connaissances socialement reconnue (diplôme, ordre) et l'utilise pour orienter l'action publique .",
  '',
  '3.',
].join('\\n');

export const TextFormatterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>(sampleInput);
  const [copied, setCopied] = useState(false);

  const formatMutation = useFormatText();
  const result = formatMutation.data;
  const loading = formatMutation.isPending;

  const formattedText = useMemo(() => result?.formatted_text ?? '', [result]);
  const errorMessage = useMemo(() => {
    if (result && !result.success) return result.message;
    if (formatMutation.error instanceof Error) return formatMutation.error.message;
    return null;
  }, [formatMutation.error, result]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    formatMutation.mutate({ text: input });
  }, [input, formatMutation]);

  const handleCopy = useCallback(() => {
    if (!formattedText) return;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [formattedText]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('textFormatter.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('textFormatter.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('textFormatter.inputLabel')}
            </label>
            <span className="text-xs text-gray-500">{t('textFormatter.literalInfo')}</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[320px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 font-mono text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder={t('textFormatter.placeholder')}
          />

          <ProcessButton
            onClick={handleFormat}
            disabled={!input.trim()}
            loading={loading}
            labelKey="textFormatter.formatButton"
            loadingLabelKey="textFormatter.processing"
            color="blue"
          />
          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('textFormatter.outputLabel')}
              </label>
              <p className="text-xs text-gray-500">
                {t('textFormatter.outputHint')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!formattedText}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              {copied ? t('textFormatter.copied') : t('textFormatter.copy')}
            </button>
          </div>

          <textarea
            value={formattedText}
            readOnly
            className="w-full min-h-[320px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 font-mono text-sm text-gray-900 dark:text-gray-100 shadow-inner"
            placeholder={t('textFormatter.outputPlaceholder')}
          />

          {result && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                {t('textFormatter.stats.original', { count: result.original_length ?? 0 })}
              </span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {t('textFormatter.stats.formatted', { count: result.formatted_length ?? 0 })}
              </span>
              {result.success && (
                <span className="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  {t('textFormatter.success')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


