/* SKD Empire — 3D township scene (Three.js r128, global THREE) */
(function (root) {
  const T = () => root.THREE;

  function create(container, opts = {}) {
    const THREE = T();
    const S = root.SKD, L = S.buildLayout(), W = S.SITE.W, D = S.SITE.D;
    const X = x => x - W / 2, Z = z => z - D / 2;
    const width = opts.width || container.clientWidth, height = opts.height || container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.still, alpha: false });
    renderer.setPixelRatio(opts.pixelRatio || Math.min(2, root.devicePixelRatio || 1));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F3EEE4').convertSRGBToLinear();
    scene.fog = new THREE.Fog(new THREE.Color('#F3EEE4').convertSRGBToLinear(), 600, 1500);
    const camera = new THREE.PerspectiveCamera(30, width / height, 1, 4000);

    scene.add(new THREE.HemisphereLight('#FFFFFF', '#B9A57E', 0.62));
    const sun = new THREE.DirectionalLight('#FFF0D8', 1.55);
    sun.position.set(-180, 260, 160);
    sun.castShadow = true;
    sun.shadow.mapSize.set(opts.shadowSize || 4096, opts.shadowSize || 4096);
    Object.assign(sun.shadow.camera, { left: -260, right: 260, top: 260, bottom: -260, near: 10, far: 900 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.4;
    scene.add(sun);

    const trees = [];
    const matCache = {};
    const M = (c, o = {}) => { const k = c + JSON.stringify(o); return matCache[k] || (matCache[k] = new THREE.MeshStandardMaterial({ color: new THREE.Color(c).convertSRGBToLinear(), roughness: 0.85, metalness: 0, ...o })); };
    const box = (w, h, d, x, y, z, mat, cast = true, recv = true, parent = scene) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'string' ? M(mat) : mat);
      m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
    };
    const cyl = (r1, r2, h, x, y, z, mat, seg = 16, parent = scene) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), typeof mat === 'string' ? M(mat) : mat);
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    };
    // site-coordinate helper: box from (x0,z0) size (w,d), base y0 height h
    const sbox = (x0, z0, w, d, y0, h, mat, cast = true) => box(w, h, d, X(x0 + w / 2), y0 + h / 2, Z(z0 + d / 2), mat, cast, true);

    /* ---------- context ---------- */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), M('#E6DFCB'));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -1.21; ground.receiveShadow = true; scene.add(ground);
    // farm patches
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const patchCols = ['#DCD6BE', '#E2DCC6', '#D5D9BC', '#E8E1CE', '#D9D2B6'];
    for (let i = -6; i <= 6; i++) for (let j = -5; j <= 6; j++) {
      const cx = i * 150 + 75, cz = j * 140 + 70;
      if (Math.abs(cx) < 230 && Math.abs(cz) < 200) continue;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(140 - rnd() * 20, 130 - rnd() * 20), M(patchCols[Math.floor(rnd() * patchCols.length)]));
      p.rotation.x = -Math.PI / 2; p.position.set(cx, -1.19, cz); p.receiveShadow = true; scene.add(p);
    }
    // site plinth
    box(W + 6, 1.2, D + 6, 0, -0.6, 0, M('#CDBB93'));
    box(W, 0.2, D, 0, 0.1, 0, M('#B7CD92'), false, true);
    // approach road + link road
    box(16, 0.3, 120, 0, -1.05, D / 2 + 63, M('#4F586C'), false); box(16, 1.25, 10, 0, -0.55, D / 2 + 5, M('#4F586C'), false);
    box(1400, 0.3, 22, 0, -1.05, D / 2 + 130, M('#4F586C'), false);
    for (let x = -680; x < 680; x += 16) box(7, 0.32, 0.5, x, -1.04, D / 2 + 130, M('#F2EAD8'), false);

    /* ---------- roads ---------- */
    const roadM = M('#4D566B', { roughness: 0.95 }), pathM = M('#DCD5C6'), lineM = M('#F2EAD8'), medianM = M('#A9C38E');
    L.roads.forEach(r => {
      if (r.blvd) {
        sbox(r.x0, r.z0, 15, r.z1 - r.z0, 0.2, 0.12, pathM, false);
        sbox(r.x0 + 1, r.z0, 5.5, r.z1 - r.z0, 0.2, 0.16, roadM, false);
        sbox(r.x0 + 8.5, r.z0, 5.5, r.z1 - r.z0, 0.2, 0.16, roadM, false);
        sbox(r.x0 + 6.6, r.z0 + 2, 1.8, r.z1 - r.z0 - 4, 0.2, 0.35, medianM, false);
      } else {
        sbox(r.x0 + 1, r.z0, r.x1 - r.x0 - 2, r.w, 0.2, 0.12, pathM, false);
        sbox(r.x0 + 1, r.z0 + 1, r.x1 - r.x0 - 2, r.w - 2, 0.2, 0.16, roadM, false);
        for (let x = r.x0 + 6; x < r.x1 - 6; x += 9) { if (x > S.SITE.blvd[0] - 3 && x < S.SITE.blvd[1] + 3) continue; sbox(x, r.z0 + r.w / 2 - 0.12, 4, 0.24, 0.36, 0.02, lineM, false); }
      }
    });

    /* ---------- plots ---------- */
    const plotMeshes = [];
    const villaPlot = L.plots.find(p => p.row === 'I' && p.side === 'R' && p.x0 === S.SITE.blvd[1]);
    L.plots.forEach(p => {
      if (p === villaPlot) return;
      const mesh = sbox(p.x0 + 0.35, p.z0 + 0.35, p.w - 0.7, p.d - 0.7, 0.2, 0.45, M(S.TYPES[p.type].color, { roughness: 0.9 }), false);
      mesh.userData.plot = p; plotMeshes.push(mesh);
      // corner pegs (front corners)
      const fz = p.facing > 0 ? p.z0 + p.d - 0.6 : p.z0 + 0.3;
      sbox(p.x0 + 0.3, fz, 0.3, 0.3, 0.65, 0.5, '#A8803F', false);
      sbox(p.x0 + p.w - 0.6, fz, 0.3, 0.3, 0.65, 0.5, '#A8803F', false);
    });

    /* ---------- walls & gate ---------- */
    const wallM = M('#F4EFE4'), capM = M('#C9A86A');
    const wall = (x0, z0, w, d) => { sbox(x0, z0, w, d, 0.2, 2.4, wallM); sbox(x0 - 0.05, z0 - 0.05, w + 0.1, d + 0.1, 2.6, 0.2, capM, false); };
    wall(0, 0, W, 0.35); wall(0, 0, 0.35, D); wall(W - 0.35, 0, 0.35, D);
    wall(0, D - 0.35, S.SITE.blvd[0] - 5, 0.35); wall(S.SITE.blvd[1] + 5, D - 0.35, W - S.SITE.blvd[1] - 5, 0.35);
    // gate
    const gx = W / 2, stone = M('#E3D3AE'), navy = M('#14213D', { roughness: 0.5 }), gold = M('#C9A86A', { roughness: 0.35, metalness: 0.4 });
    [[-12.5], [9.5]].forEach(([o]) => { sbox(gx + o, D - 2.2, 3, 3.6, 0.2, 9, stone); sbox(gx + o - 0.2, D - 2.4, 3.4, 4, 9.2, 0.5, gold, false); });
    const beam = sbox(gx - 12.5, D - 1.8, 25, 2.8, 7.2, 2.4, navy);
    const signTex = textTexture('SKD EMPIRE', '#14213D', '#E1C48A', 1024, 96);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.3), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(X(gx), 8.4, Z(D - 1.8 + 2.8) + 0.02); scene.add(sign);
    sbox(gx + 13.5, D - 7, 4, 4, 0.2, 3.2, wallM); sbox(gx + 13.2, D - 7.3, 4.6, 4.6, 3.4, 0.3, navy, false);

    /* ---------- amenity zone ---------- */
    const fz = L.frontZ + S.SITE.road, fd = D - fz - 0.35; // usable depth after last road
    // clubhouse (left of boulevard)
    const white = M('#FAF7F0'), glass = M('#6E8EA8', { roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.85 }), wood = M('#9C6B45', { roughness: 0.7 });
    const cx0 = 100, cz0 = fz + 3;
    sbox(cx0, cz0, 52, 15, 0.2, 4.6, white);
    sbox(cx0 + 2, cz0 + 15, 30, 0.3, 0.7, 3.6, glass, false);
    sbox(cx0 + 34, cz0 + 15, 16, 0.3, 0.6, 3.8, wood, false);
    sbox(cx0 + 6, cz0 + 1, 34, 13, 4.8, 4.0, white);
    sbox(cx0 + 8, cz0 + 14, 28, 0.3, 5.3, 2.8, glass, false);
    sbox(cx0 + 4, cz0 - 0.5, 38, 16, 8.8, 0.45, M('#2F3646'));
    sbox(cx0 - 1, cz0 - 1, 54, 17.5, 4.8, 0.3, M('#E9E2D3'), true);
    // pool & deck
    sbox(58, fz + 3, 38, 16, 0.2, 0.35, M('#CFAF86'));
    sbox(61, fz + 5.5, 32, 11, 0.4, 0.2, M('#58A9CC', { roughness: 0.1, metalness: 0.1 }), false);
    for (let i = 0; i < 5; i++) sbox(62 + i * 6, fz + 17.2, 1.2, 1.8, 0.55, 0.35, white, false);
    // kids play
    const play = ['#C8795A', '#7FA6C4', '#E1C48A', '#8FA77E'];
    sbox(18, fz + 4, 32, 15, 0.2, 0.25, M('#E9D7B8'), false);
    for (let i = 0; i < 4; i++) { sbox(22 + i * 7, fz + 8, 3, 3, 0.4, 2 + (i % 2), M(play[i])); }
    // utilities
    sbox(3, fz + 3, 11, 9, 0.2, 2.6, M('#B9B4AA')); sbox(3, fz + 13, 6, 5, 0.2, 2.0, M('#9CA3AF'));
    // central garden (right)
    const gcx = 225, gcz = fz + fd / 2;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.3, 48), M('#E6DCC6')); ring.position.set(X(gcx), 0.35, Z(gcz)); ring.receiveShadow = true; scene.add(ring);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 0.35, 48), M('#5FB0D3', { roughness: 0.1 })); water.position.set(X(gcx), 0.5, Z(gcz)); scene.add(water);
    cyl(0.9, 1.4, 2.6, X(gcx), 1.6, Z(gcz), M('#E9E2D3'));
    [[185, 1], [265, 1]].forEach(([x]) => sbox(x - 1, fz + 1, 2, fd - 2, 0.2, 0.18, pathM, false));
    sbox(180, gcz - 1.2, 90, 2.4, 0.2, 0.18, pathM, false);
    // sports court
    sbox(296, fz + 2, 32, 18, 0.2, 0.25, M('#C8795A'), false);
    sbox(296.6, fz + 2.6, 30.8, 0.3, 0.46, 0.02, lineM, false); sbox(296.6, fz + 19.1, 30.8, 0.3, 0.46, 0.02, lineM, false);
    sbox(311.8, fz + 2.6, 0.3, 16.8, 0.46, 0.02, lineM, false);

    /* ---------- show villa (500 sq yd) ---------- */
    const villa = new THREE.Group(); scene.add(villa);
    if (villaPlot) buildVilla(villaPlot);
    function buildVilla(p) {
      const g = villa, o = { x: X(p.x0), z: Z(p.z0) }; // local origin at plot back-left, front at +d
      const vb = (x0, z0, w, d, y0, h, mat, cast = true) => box(w, h, d, o.x + x0 + w / 2, y0 + h / 2, o.z + z0 + d / 2, mat, cast, true, g);
      const w = p.w, d = p.d;
      vb(0.2, 0.2, w - 0.4, d - 0.4, 0.2, 0.42, M('#B9D199'), false);
      vb(9.4, 19.2, 5.2, 8, 0.6, 0.06, M('#D9D2C3'), false); // driveway
      vb(4.2, 21.5, 1.4, 6, 0.6, 0.06, M('#D9D2C3'), false); // walkway
      // compound walls
      const cw = M('#F1EBDD');
      vb(0.1, d - 0.35, 3.9, 0.25, 0.6, 1.3, cw); vb(5.8, d - 0.35, 3.4, 0.25, 0.6, 1.3, cw);
      vb(0.1, 0.1, 0.25, d - 0.3, 0.6, 1.8, cw); vb(w - 0.35, 0.1, 0.25, d - 0.3, 0.6, 1.8, cw); vb(0.1, 0.1, w - 0.2, 0.25, 0.6, 1.8, cw);
      vb(9.4, d - 0.3, 5.2, 0.1, 0.6, 1.4, M('#2B2F38', { metalness: 0.5, roughness: 0.4 })); // sliding gate
      // ground floor
      const wh = M('#FBF9F4', { roughness: 0.75 });
      vb(1.2, 6, 12.2, 13, 0.6, 3.5, wh);
      vb(1.9, 18.98, 6.4, 0.1, 0.9, 2.9, glass, false);
      vb(8.6, 18.98, 0.9, 0.1, 0.6, 3.5, wood, false);
      vb(13.38, 7, 0.1, 9, 1.0, 2.5, glass, false);
      // first floor (cantilevered)
      vb(0.8, 7, 9.8, 14.5, 4.1, 3.3, wh);
      vb(1.4, 21.48, 8.6, 0.1, 4.7, 2.1, glass, false);
      for (let i = 0; i < 7; i++) vb(1.6 + i * 1.25, 21.6, 0.18, 0.18, 4.4, 2.8, wood, false); // vertical louvers
      vb(0.4, 6.6, 10.6, 15.3, 7.4, 0.35, M('#33394A')); // floating roof
      // terrace pergola over GF
      const pf = M('#3B3F4A', { metalness: 0.3, roughness: 0.5 });
      [[10.8, 6.2], [13.2, 6.2], [10.8, 18.6], [13.2, 18.6]].forEach(([x, z]) => vb(x, z, 0.16, 0.16, 4.1, 2.6, pf));
      for (let z = 6.2; z <= 18.6; z += 0.9) vb(10.7, z, 2.7, 0.12, 6.6, 0.14, wood, false);
      vb(10.7, 6, 2.8, 13, 4.1, 0.9, M('#EFE9DC'), false); // parapet line
      // car porch
      vb(9.5, 19, 4.9, 5.4, 3.5, 0.25, wood);
      vb(14.0, 23.9, 0.18, 0.18, 0.6, 2.9, pf); vb(9.6, 23.9, 0.18, 0.18, 0.6, 2.9, pf);
      // car
      const car = M('#9E2A2B', { metalness: 0.5, roughness: 0.3 });
      vb(11.0, 19.6, 1.9, 4.5, 0.95, 0.75, car); vb(11.15, 20.6, 1.6, 2.4, 1.7, 0.6, M('#22293A', { metalness: 0.4, roughness: 0.2 }));
      [[11.0, 20.3], [12.9, 20.3], [11.0, 23.2], [12.9, 23.2]].forEach(([x, z]) => { const wv = cyl(0.36, 0.36, 0.25, o.x + x, 0.98, o.z + z, M('#111'), 16, g); wv.rotation.z = Math.PI / 2; });
      // pool & deck at rear
      vb(1.6, 1.0, 11.8, 4.6, 0.6, 0.14, M('#CFAF86'), false);
      vb(2.3, 1.6, 8.6, 3.2, 0.7, 0.08, M('#4FB0D6', { roughness: 0.05, metalness: 0.1 }), false);
      vb(11.3, 1.8, 0.8, 1.9, 0.75, 0.3, wh, false); vb(12.3, 1.8, 0.8, 1.9, 0.75, 0.3, wh, false);
      // warm lights
      const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFD892').convertSRGBToLinear() });
      vb(9.9, 21.5, 4.1, 0.08, 3.45, 0.05, glow, false); vb(1.4, 19.05, 0.4, 0.05, 3.7, 0.08, glow, false);
      // planting
      treeAt(o.x + 1.4, o.z + 25.6, 0.5, '#7FA05E'); treeAt(o.x + 13.6, o.z + 3.2, 0.75, '#8DAE6A'); treeAt(o.x + 1.4, o.z + 3, 0.6, '#7FA05E');
      for (let i = 0; i < 6; i++) { const sh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), M('#6E9150')); sh.position.set(o.x + 0.8 + i * 0.6, 1.0, o.z + d - 1.0); sh.castShadow = true; g.add(sh); }
      g.userData.anchor = new THREE.Vector3(o.x + w / 2, 7.6, o.z + d / 2);
    }

    /* ---------- trees & lights (instanced) ---------- */
    function treeAt(x, z, k = 1, col) { trees.push([x, z, k, col]); }
    const crowns = ['#7FA05E', '#8DAE6A', '#6F9555', '#9DB97A'];
    let ci = 0;
    const blvd = S.SITE.blvd;
    // boulevard median
    for (let z = 6; z < D - 8; z += 9) treeAt(X((blvd[0] + blvd[1]) / 2), Z(z), 1.05, crowns[(ci++) % 4]);
    // avenue trees on internal roads
    L.roads.filter(r => !r.blvd).forEach(r => {
      for (let x = 8; x < W - 8; x += 15) { if (x > blvd[0] - 4 && x < blvd[1] + 22) continue; treeAt(X(x), Z(r.z0 + 0.6), 0.62, crowns[(ci++) % 4]); }
    });
    // side green belts
    for (let z = 4; z < L.frontZ; z += 7) { treeAt(X(3.6), Z(z), 0.85, crowns[(ci++) % 4]); treeAt(X(W - 3.6), Z(z), 0.85, crowns[(ci++) % 4]); }
    for (let x = 6; x < W - 6; x += 8) treeAt(X(x), Z(-0.0) + 0.0 + 0.0 - 0.0 + 1.6 - 0.0, 0.6, crowns[(ci++) % 4]);
    // garden clusters
    for (let a = 0; a < 14; a++) { const ang = a / 14 * Math.PI * 2; treeAt(X(gcx + Math.cos(ang) * 18), Z(gcz + Math.sin(ang) * 9.5), 0.8, crowns[(ci++) % 4]); }
    [[180, fz + 4], [270, fz + 4], [180, D - 4], [270, D - 4], [290, D - 4], [55, D - 4], [45, fz + 3], [96, D - 4], [154, D - 4], [154, fz + 4], [180, gcz], [270, gcz]].forEach(([x, z]) => treeAt(X(x), Z(z), 1, crowns[(ci++) % 4]));

    // instanced build
    const crownGeo = new THREE.IcosahedronGeometry(2.6, 1), trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 3.2, 6);
    const crownI = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), trees.length);
    const trunkI = new THREE.InstancedMesh(trunkGeo, M('#7A5C3E'), trees.length);
    crownI.castShadow = trunkI.castShadow = true;
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    trees.forEach(([x, z, k, c], i) => {
      sc.set(k, k * 1.08, k); pos.set(x, 0.6 + 3.2 * k + 1.6 * k, z); mtx.compose(pos, q, sc); crownI.setMatrixAt(i, mtx);
      crownI.setColorAt(i, col.set(c).convertSRGBToLinear());
      sc.set(k, k, k); pos.set(x, 0.6 + 1.6 * k, z); mtx.compose(pos, q, sc); trunkI.setMatrixAt(i, mtx);
    });
    scene.add(crownI, trunkI);
    // street lights
    const lamps = [];
    L.roads.filter(r => !r.blvd).forEach(r => { for (let x = 15; x < W - 10; x += 30) { if (x > blvd[0] - 4 && x < blvd[1] + 4) continue; lamps.push([X(x), Z(r.z1 - 0.5)]); } });
    for (let z = 10; z < D - 6; z += 22) { lamps.push([X(blvd[0] + 0.5), Z(z)]); lamps.push([X(blvd[1] - 0.5), Z(z)]); }
    const poleI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.14, 7, 6), M('#3A4560'), lamps.length);
    const headI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.25, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE2A6').convertSRGBToLinear() }), lamps.length);
    poleI.castShadow = true;
    lamps.forEach(([x, z], i) => { sc.set(1, 1, 1); pos.set(x, 3.7, z); mtx.compose(pos, q, sc); poleI.setMatrixAt(i, mtx); pos.set(x, 7.2, z); mtx.compose(pos, q, sc); headI.setMatrixAt(i, mtx); });
    scene.add(poleI, headI);

    /* ---------- views ---------- */
    const va = villa.userData.anchor || new THREE.Vector3();
    const VIEWS = {
      cover: { p: [300, 235, 350], t: [-78, 0, 14], fov: 30 },
      aerial: { p: [40, 400, 385], t: [0, 0, -14], fov: 33 },
      iso: { p: [260, 240, 260], t: [0, 0, 0], fov: 32 },
      villa: { p: [va.x + 27, 12.5, va.z + 31], t: [va.x - 1.5, 3.4, va.z + 1], fov: 36 },
      villaTop: { p: [va.x - 34, 38, va.z + 34], t: [va.x + 1, 1, va.z - 1], fov: 36 },
      entrance: { p: [58, 30, D / 2 + 66], t: [-12, 0, D / 2 - 46], fov: 38 },
      club: { p: [-120, 34, D / 2 + 60], t: [-40, 2, D / 2 - 18], fov: 36 }
    };
    function setView(name) {
      const v = VIEWS[name] || VIEWS.cover;
      camera.fov = v.fov; camera.position.set(...v.p); camera.updateProjectionMatrix();
      camera.lookAt(...v.t); if (api.controls) { api.controls.target.set(...v.t); api.controls.update(); }
      return v;
    }
    function project(v3) { const p = v3.clone().project(camera); return [(p.x + 1) / 2 * width, (1 - p.y) / 2 * height, p.z]; }
    const anchors = {
      gate: new THREE.Vector3(0, 10, D / 2 - 1),
      club: new THREE.Vector3(X(cx0 + 26), 9.5, Z(cz0 + 7)),
      pool: new THREE.Vector3(X(77), 1, Z(fz + 11)),
      garden: new THREE.Vector3(X(gcx), 2, Z(gcz)),
      court: new THREE.Vector3(X(312), 1, Z(fz + 11)),
      villa: va,
      blvd: new THREE.Vector3(X(167), 1, Z(110)),
      p500: new THREE.Vector3(X(80), 0.7, Z(L.rows.find(r => r.row === 'H').z0 + 14)),
      p350: new THREE.Vector3(X(250), 0.7, Z(L.rows.find(r => r.row === 'F').z0 + 10)),
      p250: new THREE.Vector3(X(70), 0.7, Z(L.rows.find(r => r.row === 'B').z0 + 8)),
      wall: new THREE.Vector3(X(W), 2.6, Z(60)),
      belt: new THREE.Vector3(X(3.6), 4, Z(120)),
      stp: new THREE.Vector3(X(8), 3, Z(fz + 8)),
      play: new THREE.Vector3(X(34), 2, Z(fz + 10))
    };
    function render() { renderer.render(scene, camera); }
    function resize(w, h) { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); api.width = w; api.height = h; }
    const api = { THREE, renderer, scene, camera, setView, render, project, anchors, plotMeshes, villaPlot, layout: L, VIEWS, resize, width, height };
    camera.aspect = width / height;
    setView(opts.view || 'cover');
    return api;
  }

  function textTexture(text, bg, fg, w, h) {
    const THREE = T();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.font = `500 ${Math.round(h * 0.62)}px Fraunces, Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (g.letterSpacing !== undefined) g.letterSpacing = '18px';
    g.fillText(text, w / 2, h / 2 + 4);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  root.SKD3D = { create };
})(window);
