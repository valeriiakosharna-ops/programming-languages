<?php
// Educational drawing bridge; functions are supplied by this trainer.
function nix_command($cmd, $value = null) {
    echo '__NIX_TURTLE__:' . json_encode(['cmd' => $cmd, 'value' => $value]) . "\n";
}
function forward($distance) {nix_command('forward', $distance);}
function right($angle) {nix_command('right', $angle);}
function left($angle) {nix_command('left', $angle);}
function color($color) {nix_command('color', $color);}
function penup() {nix_command('penup');}
function pendown() {nix_command('pendown');}
