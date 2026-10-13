/** Educational drawing bridge; this is not part of standard Java. */
public class Turtle {
    private static void command(String cmd, double value) {
        System.out.println("__NIX_TURTLE__:{\"cmd\":\"" + cmd + "\",\"value\":" + value + "}");
    }
    public static void forward(double value) {command("forward", value);}
    public static void right(double value) {command("right", value);}
    public static void left(double value) {command("left", value);}
    public static void color(String value) {
        if (!value.matches("#[0-9a-fA-F]{6}")) throw new IllegalArgumentException("Use a hex color such as #00A6EB");
        System.out.println("__NIX_TURTLE__:{\"cmd\":\"color\",\"value\":\"" + value + "\"}");
    }
    public static void penup() {System.out.println("__NIX_TURTLE__:{\"cmd\":\"penup\"}");}
    public static void pendown() {System.out.println("__NIX_TURTLE__:{\"cmd\":\"pendown\"}");}
}
