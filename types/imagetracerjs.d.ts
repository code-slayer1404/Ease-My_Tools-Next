declare module "imagetracerjs" {
  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    strokewidth?: number;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    lcpr?: number;
    qcpr?: number;
    blurradius?: number;
    blurdelta?: number;
  }
  interface ImageTracerStatic {
    imageToSVG(
      url: string,
      callback: (svgString: string) => void,
      options?: ImageTracerOptions,
    ): void;
  }
  const ImageTracer: ImageTracerStatic;
  export default ImageTracer;
}
