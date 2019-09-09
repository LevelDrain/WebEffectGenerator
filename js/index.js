const init = () => {
    const $canvas = document.querySelector('#Canvas'),
        $selected1 = document.querySelector('#MagicElement'),
        $selected2 = document.querySelector('#MagicForm');
    //$selected3 = document.querySelector('#SubEffect');
    //const width = $canvas.width, height = $canvas.height;

    //-- Three.js シーン設定 --
    const width = $canvas.width = 800;
    const height = $canvas.height = 600;
    console.log(document.querySelector('main').width);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ canvas: $canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);

    const light = new THREE.DirectionalLight(0xffffff);
    light.intensity = 3;
    light.position.set(1, 1, 1);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = .5;
    scene.add(ambientLight);

    const controls = new THREE.OrbitControls(camera, $canvas);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    //----- デフォルト画面を作るベースの変数や関数群 -----
    //--デフォルト設定--
    let setMagic = 'wind';
    let loader = new THREE.TextureLoader(); // テクスチャーを読み込み
    let map = loader.load('./img/' + setMagic + '.png');
    let material = new THREE.MeshBasicMaterial({
        map: map,
        transparent: true,
        side: THREE.DoubleSide,
        flatShading: true
    });
    let sprite = new THREE.Sprite(material);
    sprite.scale.multiplyScalar(10);

    //モデリング用変数宣言（デフォルト：渦）
    let points = [], i = 0;
    for (; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 5, (i - 5) * 2));
    }
    let mesh = new THREE.Mesh(
        new THREE.LatheBufferGeometry(points),
        material
    );
    map.wrapS = map.wrapT = THREE.RepeatWrapping;//テクスチャのリピート
    scene.add(mesh);

    let circles = [], j = 0, l = 300;
    for (; j < l; j++) {
        let circle = new THREE.Mesh(
            new THREE.SphereGeometry(.08, 16),
            new THREE.MeshBasicMaterial({
                map: loader.load('./img/Particle02.png'),
                transparent: true
            })
        );
        let max = .5, min = max / 2;
        circle.move = {
            x: Math.random() * max - min,
            y: Math.random() * max,
            z: Math.random() * max - min
        }
        circle.position.y = -12;
        circle.position.x = 0;
        circle.position.z = 0;
        circle.material.opacity = Math.random();
        circle.defPos = circle.getWorldPosition();//初期位置を記録

        circles.push(circle);
        scene.add(circle);
    }

    let magicCircle = new THREE.Mesh(
        new THREE.CircleGeometry(8, 32),
        new THREE.MeshBasicMaterial({
            map: loader.load('./img/magic_circuit04.png'),
            side: THREE.DoubleSide,
            transparent: true
        })
    );
    magicCircle.position.y = -12;
    magicCircle.rotation.x = -Math.PI / 2;
    scene.add(magicCircle);

    document.querySelector('#threeMethods').innerHTML =
        "<p>" +
        "THREE.MeshBasicMaterial()<br>" +
        "THREE.TextureLoader()<br>" +
        "THREE.RepeatWrapping" +
        "THREE.Vector2()<br>" +
        "THREE.Mesh()<br>" +
        "THREE.LatheBufferGeometry()</p>";
    //------------------------------------------

    //----- 編集で呼ばれる関数群 -----
    //-- テクスチャ関係の関数 --
    const editMagicElement = (selecter) => {
        let options = selecter.options;
        setMagic = options[options.selectedIndex].value;
        loader = new THREE.TextureLoader(); // テクスチャーを読み込み
        map = loader.load('./img/' + setMagic + '.png');
        if (material) material.map = map;
        map.wrapS = map.wrapT = THREE.RepeatWrapping;//ラップし直し

        document.querySelector('#threeMethods').innerHTML =
            "<p>" +
            "THREE.MeshBasicMaterial()<br>" +
            "THREE.TextureLoader()<br>" +
            "THREE.RepeatWrapping</p>";
    }

    //-- モデリング関数 --
    const editMagicForm = (selectVal) => {
        scene.remove(mesh);
        if (selectVal == 'storm') {
            let points = [], i = 0;
            for (; i < 10; i++) {
                points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 5, (i - 5) * 2));
            }
            material.side = THREE.DoubleSide;
            mesh = new THREE.Mesh(
                new THREE.LatheBufferGeometry(points),
                material
            );
            map.wrapS = map.wrapT = THREE.RepeatWrapping;

            document.querySelector('#threeMethods').innerHTML =
                "<p>" +
                "THREE.Vector2()<br>" +
                "THREE.Mesh()<br>" +
                "THREE.LatheBufferGeometry()<br>" +
                "THREE.RepeatWrapping<br>（ラッピングし直し）</p>";

        } else if (selectVal == 'sphere') {
            material.side = THREE.FrontSide;
            mesh = new THREE.Mesh(
                new THREE.SphereGeometry(8, 32, 32),
                material
            );
            map.wrapS = map.wrapT = THREE.RepeatWrapping;

            document.querySelector('#threeMethods').innerHTML =
                "<p>" +
                "THREE.SphereGeometry()<br>" +
                "THREE.Mesh()<br>" +
                "THREE.RepeatWrapping<br>（ラッピングし直し）</p>";
        }
        scene.add(mesh);
    }

    //TODO: 追加エフェクト機能実装予定
    // const addSubEffect = (selecter) => {
    //     fog = new THREE.Mesh(
    //         geometry = new THREE.CircleGeometry(5, 32),
    //         material
    //     );
    // }
    //------------------------------------------

    //-- GUIの実装 --
    $selected1.addEventListener('change', () => {
        editMagicElement(event.target);
    });

    $selected2.addEventListener('change', () => {
        editMagicForm(event.target.value);
        //console.log(event.target.value);
    });

    //-- アニメーションフレーム --
    const tick = () => {
        // 毎フレーム位置を0.01ずつ動かす。
        map.offset.x -= 0.03;
        //map.offset.y -= 0.03;

        circles.forEach(circle => {
            let delta = 0.001;
            circle.position.x += circle.move.x;
            circle.position.y += circle.move.y;
            circle.position.z += circle.move.z;
            circle.material.opacity -= delta;

            if (circle.material.opacity <= 0) {
                circle.position.set(circle.defPos.x, circle.defPos.y, circle.defPos.z);
                circle.material.opacity = Math.random();
            }
        });

        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();
}
onload = init;