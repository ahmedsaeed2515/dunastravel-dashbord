import { useTranslations } from 'next-intl';

export default function DashboardIndex() {
  const t = useTranslations('Index');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-display font-semibold text-primary">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </div>
    </div>
  );
}
