export const iconCodepoints={
  house:0xf015,'book-open':0xf518,sun:0xf185,'chart-simple':0xe473,'table-cells-large':0xf009,
  sliders:0xf1de,compress:0xf066,expand:0xf065,'chevron-down':0xf078,'chevron-right':0xf054,'chevron-left':0xf053,
  'rotate-right':0xf2f9,play:0xf04b,pause:0xf04c,headphones:0xf025,bookmark:0xf02e,
  ellipsis:0xf141,repeat:0xf363,'forward-step':0xf051,'backward-step':0xf048,
  minus:0xf068,plus:0x2b,file:0xf15b,music:0xf001,xmark:0xf00d,
  'circle-check':0xf058,circle:0xf111,
} as const;
export type AppIconName=keyof typeof iconCodepoints;
