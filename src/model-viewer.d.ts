declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      poster?: string;
      ar?: boolean | '';
      'camera-controls'?: boolean | '';
      'auto-rotate'?: boolean | '';
      'shadow-intensity'?: number | string;
      exposure?: number | string;
      'environment-image'?: string;
      'ios-src'?: string; // if you add a .usdz later
    };
  }
}
