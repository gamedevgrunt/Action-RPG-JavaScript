import { SPELLS } from './combat/SPELLS.js';

export function setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate) {
    let inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        var key = evt.sourceEvent.key;
        inputMap[key.match(/[a-zA-Z]/) ? key.toLowerCase() : key] = evt.sourceEvent.type === "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        // inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        var key = evt.sourceEvent.key;
        inputMap[key.match(/[a-zA-Z]/) ? key.toLowerCase() : key] = evt.sourceEvent.type === "keydown";
        // console.log(evt.sourceEvent.key);
    }));
    scene.onBeforeRenderObservable.add(() => handleCharacterMovement(inputMap, character, camera, hero, anim, engine, dummyAggregate));


    // todo move to own function
    
            // Function to get canvas-relative touch position
            const canvas = document.getElementById("renderCanvas");
            function getCanvasRelativePosition(event) {
                const rect = canvas.getBoundingClientRect();
                const touch = event.touches[0]; // Get the first touch
                const xPos = touch.clientX - rect.left;
                const yPos = touch.clientY - rect.top;
                return new BABYLON.Vector2(xPos, yPos);
            }

            // Function to move character towards a point
            function moveCharacterToPoint(point, character, scene) {
                const pickResult = scene.pick(point.x, point.y);
                if (pickResult.hit) {
                    const target = pickResult.pickedPoint;
                    console.log(target);

                    character.touchTarget = target;

                    // const direction = target.subtract(character.position).normalize();
                    // direction.y = 0; // Keep the movement horizontal
                    // const moveSpeed = 0.1; // Speed at which the character moves
                    // character.position.addInPlace(direction.scale(moveSpeed));
                }
            }

            let characterSpeed = 5; // Speed of the character moving towards the target
            // scene.onBeforeRenderObservable.add(() => moveToTargetPoint());
            function moveToTargetPoint() {
                if (!character) return; // Check if character and targetPoint are defined
               
            }
            // Add touch event listener to canvas
            canvas.addEventListener("touchstart", function(event) {
                
                const point = getCanvasRelativePosition(event);
                // if (point.isEnemy) {attack}
                // else 
                moveCharacterToPoint(point, character, scene);
                // character.target = character.position;



            });
}

function handleGamepadInput(gamepad, character) {
    gamepad.onleftstickchanged((values) => {
        // Using the left stick to move the character or adjust camera angle
        let inputVelocity = new BABYLON.Vector3(values.x, 0, values.y).scaleInPlace(0.1);
        character.moveWithCollisions(inputVelocity);
    });

    gamepad.onbuttondown((button) => {
        if (button === BABYLON.Xbox360Button.A) {
            // Jump action, for example
            let jumpImpulse = new BABYLON.Vector3(0, 10, 0);
            if (character.physicsImpostor) {
                character.physicsImpostor.applyImpulse(jumpImpulse, character.getAbsolutePosition());
            }
        }
    });

    // Add more button interactions as needed
}



function DoCombo() {
    if (combo > 3) combo = 0;
    combo += 1;
    console.log(combo);
    SPELLS.quickSwing.cast(PLAYER.health, PLAYER.target.health);
}
// document.getElementById("renderCanvas").addEventListener('mousedown', function(event) {
//         console.log("do combo");
//         DoCombo();
// });
document.getElementById("renderCanvas").addEventListener("click", function(evt) {
    DoCombo();
});


window.addEventListener('keydown', onKeyDown);
function onKeyDown(event) {
    if (event.key ==="f") SPRINTING = !SPRINTING;
    if (event.key === "4") {
        DoCombo();
    }
    if (event.key ==="5") {
        SPELLS.heavySwing.cast(PLAYER.health, PLAYER.target.health);
        
    }
    if (event.key === "1") {
        SPELLS.fireball.cast(PLAYER.health, PLAYER.target.health);
        // play spell in spot 6 instead
    }

}





let combo = 0;

let SPRINTING = false;
let normalSpeed = 80.0;
let rollSpeed = 1.6;
let sprintSpeed = 1.5;
let speed = normalSpeed;
let lastMoveDirection = BABYLON.Vector3.Zero();
let mobileMoving = false;
function handleCharacterMovement(inputMap, character, camera, hero, anim, engine, dummyAggregate) {

    var forward = camera.getFrontPosition(1).subtract(camera.position).normalize().scaleInPlace(speed);
        forward.y = 0;  // Ensure the player only moves horizontally
        // fix the player stopping moving when camera above

        var forwardAngle = Math.atan2(forward.x, forward.z);
        // Set the character's rotation to face the direction the camera is looking

        var right = forward.clone().rotateByQuaternionAroundPointToRef(
            BABYLON.Quaternion.FromEulerAngles(0, Math.PI / 2, 0), 
            BABYLON.Vector3.Zero(), 
            new BABYLON.Vector3()
        );
        

    // let moveDirection = dummyAggregate.body.getLinearVelocity();
    let moveDirection = new BABYLON.Vector3(lastMoveDirection.x,  lastMoveDirection.y ,lastMoveDirection.z);
    if (!anim.Roll.isPlaying && !anim.Attack.isPlaying) {
        moveDirection = new BABYLON.Vector3(0, dummyAggregate.body.getLinearVelocity().y ,0);
    }
    // let moveDirection = dummyAggregate.body.getLinearVelocity();
    if (inputMap["w"] || inputMap["ArrowUp"]) {
        moveDirection.addInPlace(forward); // Forward
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI, 0, 0);
        hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);

        if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
            for (let key in anim) {
                if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                    if (key !== 'Running')anim[key].stop();
                }
            }
            anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);
        }

        
        // anim.Running.play();
        // anim.Running.weight = 0.5;
        // scene.beginAnimation(hero, anim.Running.from, anim.Running.to, true);
        // anim.Running._weight = 1;
        
    }
    if (inputMap["s"] || inputMap["ArrowDown"]) {
        moveDirection.subtractInPlace(forward); 
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
            for (let key in anim) {
                if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                    if (key !== 'Running')anim[key].stop();
                }
            }
            anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);
        }
    }
    if (inputMap["q"] || inputMap["ArrowLeft"]) {
        moveDirection.subtractInPlace(right.scaleInPlace(0.7));
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI/2, 0, 0);
        hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);
        if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
            for (let key in anim) {
                if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                    if (key !== 'Running')anim[key].stop();
                }
            }
            anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);
        }
    }
    if (inputMap["e"] || inputMap["ArrowRight"]) {
        moveDirection.addInPlace(right.scaleInPlace(0.7));
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(-Math.PI/2, 0, 0);
        hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);
        if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
            for (let key in anim) {
                if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                    if (key !== 'Running')anim[key].stop();
                }
            }
            anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);
        }
    }
    
    // do for all four directions
    if (inputMap["q"] && inputMap["w"]) {
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(3 * Math.PI/4, 0, 0);
        hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);
        moveDirection.scaleInPlace(0.72);
    }

    if (SPRINTING) {
        
        moveDirection =forward.scaleInPlace(sprintSpeed); // fix running in air when sprinting
        hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
        var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI, 0, 0);
        hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);
    
        if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
    
            for (let key in anim) {
                if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                    if (key !== 'Running')anim[key].stop();
                }
            }
            anim.Running.start(true, 1.5, anim.Running.from, anim.Running.to, false);
    
        }
    }
    
    if (moveDirection.length() > 0) {
        // character.moveWithCollisions(moveDirection);
        // if (!anim.Roll.isPlaying) {
        // }

        dummyAggregate.body.setLinearVelocity(moveDirection);
            if (anim.Roll.isPlaying || anim.Attack.isPlaying || anim.Combo.isPlaying) {
                dummyAggregate.body.setLinearVelocity(moveDirection.scaleInPlace(0.5 * rollSpeed));
            } else {
                lastMoveDirection = moveDirection;
            }
        
    }

    


    if (!inputMap["w"] && !inputMap["s"]  && !inputMap["q"]  && !inputMap["e"] && !SPRINTING && !mobileMoving) {
        //Default animation is idle when no key is down   

        // anim.BreathingIdle.start(true, 1.0, anim.BreathingIdle.from, anim.BreathingIdle.to, true);
        anim.Running.stop();
        // for (let key in anim) {
        //     if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
        //         if (key !== 'BreathingIdle')anim[key].stop();
        //     }
        // }
        if (!anim.Roll.isPlaying &&  !anim.SelfCast.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying) {
            anim.BreathingIdle.play(true);
        }
        
        //Stop all animations besides Idle Anim when no key is down
        // sambaAnim.stop();

        // console.log(anim.Running._weight);
        // if (anim.Running._weight >= -1 ) {
        //     anim.Running._weight -= 0.03;
        // }
        
        // walkBackAnim.stop();
    }






    let combo1length = anim.Combo.from + 60;
    let combo2length = anim.Combo.from + 110;
    // combo
    if (inputMap["4"]) {
        anim.BreathingIdle.stop();
        anim.Running.stop();
        if (!anim.Roll.isPlaying &&  !anim.Running.isPlaying) {
        for (let key in anim) {
            if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                if (key !== 'Combo')anim[key].stop();
            }
        }


        if (combo === 1) {
            // anim.Combo.start(false, 1.8, combo1length -5, combo2length, true);
            combo+=1;
        }
        if (combo === 2) {
            anim.Combo.start(false, 1.8, anim.Combo.from + 25, combo1length, true);
        }
        if (combo === 3) {
            anim.Combo.start(false, 1.8, combo2length, anim.Combo.to, true);
            combo = 0;
        }

        
    }
    }


    // todo replace input map with keyrebind
    // todo replace with spell system. 
    if (inputMap["5"]) {
        anim.BreathingIdle.stop();
        anim.Running.stop();
        if (!anim.Roll.isPlaying &&  !anim.Running.isPlaying) {
        for (let key in anim) {
            if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                if (key !== 'Attack')anim[key].stop();
            }
        }
        anim.Attack.start(false, 1.3, anim.Attack.from, anim.Attack.to - 20, true);

        // spawn effect
    }
    }

    if (inputMap["c"]) {
        // anim.Running.stop();
        if (!anim.Roll.isPlaying &&  !anim.Running.isPlaying) {
        for (let key in anim) {
            if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
                if (key !== 'SelfCast')anim[key].stop();
            }
        }
        // anim.SelfCast.play();
        anim.SelfCast.start(false, 1.0, anim.SelfCast.from, anim.SelfCast.to - 50, true);
    }
    }

    if (inputMap[" "]) {
        anim.BreathingIdle.stop();
        anim.Running.stop();
        anim.Roll.start(false, 2.0, anim.Roll.from, anim.Roll.to, true);
        // speed = rollSpeed;
        // setTimeout(() => speed = normalSpeed, 800); 
}


    if (inputMap["v"] ) {
        // let jumpImpulse = new BABYLON.Vector3(0, 20, 0);
        anim.Jump.start(false, 1.0, anim.Jump.from + 30, anim.Jump.to -40, false);
        if (character.physicsImpostor) {
            // character.physicsImpostor.applyImpulse(jumpImpulse, character.getAbsolutePosition());
        }
    }

    
    const characterSpeed = 3000;
    if (character.touchTarget) {
        const distanceToTarget = BABYLON.Vector3.Distance(character.position, character.touchTarget);
    
        if (distanceToTarget > 15.5) { // Provide a threshold to stop moving when close enough
            const direction = character.touchTarget.subtract(character.position).normalize();
            const step = direction.scale(characterSpeed / 60); // Assuming about 60 FPS
            // character.position.addInPlace(step);
            dummyAggregate.body.setLinearVelocity(step);
            console.log("mov");
            let forwardAngle = Math.atan2(direction.x, direction.z);
            hero.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(forwardAngle, 3.14, 0);
            var rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI, 0, 0);
            hero.rotationQuaternion = rotationQuaternion.multiply(hero.rotationQuaternion);
    
            // if (!anim.Roll.isPlaying && !anim.Attack.isPlaying && !anim.Combo.isPlaying){
            //     for (let key in anim) {
            //         if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
            //             if (key !== 'Running')anim[key].stop();
            //         }
            //     }
            //     anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);
            // }

            mobileMoving =true;
            anim.Running.start(true, 1.1, anim.Running.from, anim.Running.to, false);

        } else {
            mobileMoving = false;
            // character.position.copyFrom(character.touchTarget); // Snap to the target position to stop movement
            // Optionally, remove this observer if no longer needed
            // scene.onBeforeRenderObservable.remove(moveToTargetObserver);
        }
    }
}

function stopAllAnimations() {
    for (let key in anim) {
        if (anim.hasOwnProperty(key) && anim[key].isPlaying) {
            anim[key].stop();
        }
    }
}