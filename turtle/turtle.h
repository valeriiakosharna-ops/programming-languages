#ifndef NIX_TURTLE_H
#define NIX_TURTLE_H
#include <iostream>
#include <string>
namespace turtle {
inline void command(const std::string& name, double value) {
    std::cout << "__NIX_TURTLE__:{\"cmd\":\"" << name << "\",\"value\":" << value << "}\n";
}
inline void forward(double value) {command("forward",value);}
inline void right(double value) {command("right",value);}
inline void left(double value) {command("left",value);}
inline void color(const std::string& value) {
    if (value.size()!=7 || value[0]!='#' || value.find_first_not_of("0123456789abcdefABCDEF",1)!=std::string::npos) return;
    std::cout << "__NIX_TURTLE__:{\"cmd\":\"color\",\"value\":\"" << value << "\"}\n";
}
inline void penup() {std::cout << "__NIX_TURTLE__:{\"cmd\":\"penup\"}\n";}
inline void pendown() {std::cout << "__NIX_TURTLE__:{\"cmd\":\"pendown\"}\n";}
}
#endif
