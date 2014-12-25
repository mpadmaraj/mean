#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "../include/eHealth.h"
#include <sstream>
#include <string>

using std::string;

using namespace v8;
int cont = 0;

string IntToString (int a)
{
    std::ostringstream temp;
    temp<<a;
    return temp.str();
}

Handle<Value> Measure(const Arguments& args) {
  HandleScope scope;
 // printf("PRbpm : %d",eHealth.getBPM());

    string str;
    str.append("{\"pulse\":");
    str.append(IntToString(eHealth.getBPM()).c_str());
    str.append(",\"spo2\":");
    str.append(IntToString(eHealth.getOxygenSaturation()).c_str());
    
    str.append("}");
    printf(str.c_str());

    //printf("    %%SPo2 : %d\n", eHealth.getOxygenSaturation());
    
    return scope.Close(String::New(str.c_str()));
}

void readPulsioximeter(){
    
    cont ++;
    if (cont == 500) { //Get only of one 50 measures to reduce the latency
        eHealth.readPulsioximeter();
        cont = 0;
    }
}

void Init(Handle<Object> exports) {
  //eHealth.readBloodPressureSensor();
  //delay(100);
    
    eHealth.initPulsioximeter();
    //Attach the inttruptions for using the pulsioximeter.
    attachInterrupt(6, readPulsioximeter, RISING);
    
    exports->Set(String::NewSymbol("measure"), FunctionTemplate::New(Measure)->GetFunction());
}

NODE_MODULE(addon, Init)