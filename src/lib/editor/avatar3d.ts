// Code-built 3D avatar heads driven by the face's expression blendshapes — no
// external GLB assets. Each style builds a THREE.Group (head + eyes + mouth +
// accents); driveAvatar maps blendshapes → blink / mouth-open / smile and the
// head pose. Shared by web + renderer copies of FaceAvatarVideo.

import * as THREE from 'three';

export interface Avatar3D { id: string; name: string; icon: string; }
export const AVATARS: Avatar3D[] = [
  { id: 'alien', name: 'Alien', icon: '👽' },
  { id: 'cosmic', name: 'Cosmic', icon: '✨' },
  { id: 'robot', name: 'Robot', icon: '🤖' },
];

export interface BuiltAvatar {
  group: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  mouth: THREE.Mesh;
  eyeBaseY: number;
  mouthBaseX: number;
  dispose: () => void;
}

export function buildAvatar(style: string): BuiltAvatar {
  const group = new THREE.Group();
  const junk: Array<{ dispose: () => void }> = [];
  const reg = <T extends { dispose: () => void }>(o: T): T => { junk.push(o); return o; };

  let headMat: THREE.MeshStandardMaterial, eyeMat: THREE.MeshStandardMaterial, mouthMat: THREE.MeshStandardMaterial;
  if (style === 'robot') {
    headMat = new THREE.MeshStandardMaterial({ color: 0xc2cad6, metalness: 0.85, roughness: 0.3 });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.4 });
    mouthMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  } else if (style === 'cosmic') {
    headMat = new THREE.MeshStandardMaterial({ color: 0x241a45, emissive: 0x4b2f8c, emissiveIntensity: 0.75, roughness: 0.35, metalness: 0.25 });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, emissive: 0x66ccff, emissiveIntensity: 1.3 });
    mouthMat = new THREE.MeshStandardMaterial({ color: 0x160826, emissive: 0x3a1466, emissiveIntensity: 0.5 });
  } else {
    headMat = new THREE.MeshStandardMaterial({ color: 0x8fc46e, roughness: 0.5 });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x06060c, roughness: 0.2 });
    mouthMat = new THREE.MeshStandardMaterial({ color: 0x1a0a12 });
  }
  reg(headMat); reg(eyeMat); reg(mouthMat);

  const headGeo = reg(new THREE.SphereGeometry(1, 48, 48));
  const head = new THREE.Mesh(headGeo, headMat);
  head.scale.set(0.98, 1.18, 0.95);
  group.add(head);

  const eyeGeo = reg(new THREE.SphereGeometry(1, 24, 24));
  const eyeBaseY = style === 'alien' ? 0.5 : 0.26;
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  if (style === 'alien') { leftEye.scale.set(0.34, eyeBaseY, 0.2); leftEye.rotation.z = 0.4; }
  else leftEye.scale.set(0.25, eyeBaseY, 0.17);
  leftEye.position.set(-0.42, 0.13, 0.9);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.scale.copy(leftEye.scale);
  rightEye.rotation.z = -leftEye.rotation.z;
  rightEye.position.set(0.42, 0.13, 0.9);
  group.add(leftEye, rightEye);

  const mouthGeo = reg(new THREE.SphereGeometry(1, 24, 16));
  const mouthBaseX = 0.3;
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.scale.set(mouthBaseX, 0.05, 0.1);
  mouth.position.set(0, -0.52, 0.9);
  group.add(mouth);

  if (style === 'robot') {
    const rodMat = reg(new THREE.MeshStandardMaterial({ color: 0x888f9c, metalness: 0.8, roughness: 0.3 }));
    const rod = new THREE.Mesh(reg(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8)), rodMat);
    rod.position.set(0, 1.4, 0); group.add(rod);
    const bulbMat = reg(new THREE.MeshStandardMaterial({ color: 0xff5566, emissive: 0xff2244, emissiveIntensity: 1.3 }));
    const bulb = new THREE.Mesh(reg(new THREE.SphereGeometry(0.13, 16, 16)), bulbMat);
    bulb.position.set(0, 1.68, 0); group.add(bulb);
  }

  return {
    group, leftEye, rightEye, mouth, eyeBaseY, mouthBaseX,
    dispose: () => { for (const d of junk) { try { d.dispose(); } catch { /* noop */ } } },
  };
}

/** Map blendshapes → the avatar's blink / jaw / smile, plus head pose. */
export function driveAvatar(a: BuiltAvatar, blend: Record<string, number>, yaw: number, pitch: number): void {
  const blinkL = Math.min(0.95, blend.eyeBlinkLeft || 0);
  const blinkR = Math.min(0.95, blend.eyeBlinkRight || 0);
  a.leftEye.scale.y = a.eyeBaseY * (1 - blinkL);
  a.rightEye.scale.y = a.eyeBaseY * (1 - blinkR);
  const jaw = blend.jawOpen || 0;
  a.mouth.scale.y = 0.05 + jaw * 0.42;
  a.mouth.position.y = -0.52 - jaw * 0.14;
  const smile = ((blend.mouthSmileLeft || 0) + (blend.mouthSmileRight || 0)) / 2;
  a.mouth.scale.x = a.mouthBaseX + smile * 0.18;
  a.group.rotation.set(pitch, yaw, 0);
}
