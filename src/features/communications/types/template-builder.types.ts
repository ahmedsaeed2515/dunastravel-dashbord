export type PresetId = 'obsidian_gold' | 'royal_sapphire' | 'desert_amber' | 'minimalist_pearl';

export interface EmailThemeColors {
  canvasBg: string;
  cardBg: string;
  accentColor: string;
  accentGradient: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  headerBg?: string;
}

export interface EmailBrandingConfig {
  companyName: string;
  logoUrl?: string;
  bannerUrl?: string;
  badgeText?: string;
}

export interface EmailContentConfig {
  subject?: string;
  preheader?: string;
  greeting?: string;
  bodyHtml: string;
}

export interface EmailHighlightBoxConfig {
  enabled: boolean;
  type: 'OTP_CODE' | 'FEATURE_CARD';
  title?: string;
  value?: string;
  note?: string;
}

export interface EmailCtaButtonConfig {
  enabled: boolean;
  text: string;
  url: string;
  style?: 'GRADIENT' | 'SOLID' | 'OUTLINE';
}

export interface EmailFooterConfig {
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  securityNotice?: string;
  copyrightYear?: string;
}

export interface EmailSocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  linkedin?: string;
}

export interface EmailDesignConfig {
  presetId?: PresetId;
  theme: EmailThemeColors;
  branding: EmailBrandingConfig;
  content: EmailContentConfig;
  highlightBox?: EmailHighlightBoxConfig;
  ctaButton?: EmailCtaButtonConfig;
  footer: EmailFooterConfig;
  socialLinks?: EmailSocialLinks;
}

export interface TemplatePresetItem {
  id: PresetId;
  name: string;
  nameAr: string;
  config: EmailDesignConfig;
  sampleHtml?: string;
}

export type BroadcastAudienceType = 'ALL_USERS' | 'VERIFIED_CUSTOMERS' | 'MARKETING_OPT_IN' | 'CUSTOM_LIST';

export interface SendTestEmailPayload {
  recipientEmail: string;
  subject: string;
  bodyHtml: string;
  sampleVariables?: Record<string, string>;
}

export interface BroadcastCampaignPayload {
  subject: string;
  bodyHtml: string;
  recipientGroup: BroadcastAudienceType;
  customEmails?: string[];
  campaignName?: string;
  templateId?: string;
}

export interface BroadcastCampaignResult {
  success: boolean;
  campaignId: string;
  campaignName: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}
