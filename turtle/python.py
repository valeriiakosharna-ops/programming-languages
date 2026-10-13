"""Educational turtle bridge: draw commands are rendered by the page's SVG canvas."""
import json

def _command(cmd, value=None):
    print('__NIX_TURTLE__:' + json.dumps({'cmd': cmd, 'value': value}))

def forward(distance): _command('forward', distance)
def right(angle): _command('right', angle)
def left(angle): _command('left', angle)
def color(value): _command('color', value)
def penup(): _command('penup')
def pendown(): _command('pendown')
def backward(distance): forward(-distance)
def speed(value): pass
def done(): pass

class Turtle:
    forward = staticmethod(forward)
    backward = staticmethod(backward)
    right = staticmethod(right)
    left = staticmethod(left)
    color = staticmethod(color)
    penup = staticmethod(penup)
    pendown = staticmethod(pendown)
    speed = staticmethod(speed)
