export const Gap = ['xsmall', 'small', 'medium', 'large', 'xlarge', 'super'] as const;
export type GapType = (typeof Gap)[number];
