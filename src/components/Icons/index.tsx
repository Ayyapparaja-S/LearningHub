import { SvgIcon, type SvgIconProps } from '@mui/material';

export const ChevronDownIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <polyline points="6 8 10 12 14 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

export const ChevronRightIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

export const BookIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 16 16" {...props}>
    <path d="M2 2h4.5c.83 0 1.5.67 1.5 1.5V14l-1-.67c-.33-.22-.67-.33-1-.33H2V2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2H9.5C8.67 2 8 2.67 8 3.5V14l1-.67c.33-.22.67-.33 1-.33H14V2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

export const LinkIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 14 14" {...props}>
    <path d="M6 7.5a3 3 0 004.24.36l2-2a3 3 0 00-4.24-4.24l-1.15 1.15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6.5a3 3 0 00-4.24-.36l-2 2a3 3 0 004.24 4.24l1.14-1.14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);
