export const palette = {
  light: { background:'#F8FAF7', surface:'#FFFFFF', primary:'#176B57', accent:'#C99A42', text:'#172D27',
    muted:'#53665E', border:'#DFE8E1', soft:'#EAF3ED', danger:'#AA2936', onPrimary:'#FFFFFF' },
  dark: { background:'#0B1323', surface:'#15223A', primary:'#9ABCEB', accent:'#E4BC74', text:'#F2F5FC',
    muted:'#B5C3D8', border:'#30425F', soft:'#1C3048', danger:'#FFB4B4', onPrimary:'#0B1323' }
} as const;
export type Colors = { [K in keyof typeof palette.light]: string };
