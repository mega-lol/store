import * as THREE from 'three';

/**
 * A projected decal's volume passes through the shell it decorates, so the
 * geometry it clips out includes BOTH skins — the surface it belongs on and a
 * mirrored ghost on the far side (blessing under the visor, patches inside
 * the crown). The two skins disagree in exactly one way: which direction
 * their normals point. Discard every fragment whose surface faces away from
 * the projector and only the outer skin survives.
 *
 * Returns an onBeforeCompile patch closed over the projector's outward axis
 * in the target's local space (the same space DecalGeometry preserves
 * normals in). One axis per decal, compiled in — no uniforms, no per-frame
 * work.
 */
export function keepFacing(axis: [number, number, number]) {
  const [x, y, z] = new THREE.Vector3(...axis).normalize().toArray();
  const glsl = `vec3(${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)})`;
  const patch = (shader: { vertexShader: string; fragmentShader: string }) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vProjFacing;')
      .replace(
        '#include <defaultnormal_vertex>',
        `#include <defaultnormal_vertex>\nvProjFacing = dot(normalize(objectNormal), ${glsl});`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vProjFacing;')
      .replace(
        '#include <alphatest_fragment>',
        `if (vProjFacing < 0.05) discard;\n#include <alphatest_fragment>`,
      );
  };
  // Distinct axes need distinct programs; same axis shares one.
  (patch as { customProgramCacheKey?: string }).customProgramCacheKey = glsl;
  return patch;
}
