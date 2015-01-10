#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "../include/eHealth.h"
#include <sstream>
#include <string>
#include <unistd.h>

using std::string;

using namespace v8;
int cont = 0;
int bpReadings=0;
int spo2Readings=0;
unsigned int microseconds=30;

string IntToString (int a)
{
    std::ostringstream temp;
    temp<<a;
    return temp.str();
}

Handle<Value> Measure(const Arguments& args) {
  HandleScope scope;
 // printf("PRbpm : %d",eHealth.getBPM());

     for (int i = 0; i < 10; ++i){
        bpReadings=bpReadings+eHealth.getBPM();
        spo2Readings=spo2Readings+eHealth.getOxygenSaturation();
        unistd::usleep(microseconds);
     }
     bpReadings=bpReadings/10;
     spo2Readings=spo2Readings/10;
    string str;
    str.append("{\"pulse\":");
    str.append(IntToString(bpReadings).c_str());
    str.append(",\"spo2\":");
    str.append(IntToString(spo2Readings).c_str());
    
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
    
    exports->Set(String::NewSymbol("getReadings"), FunctionTemplate::New(Measure)->GetFunction());
}

NODE_MODULE(addon, Init)