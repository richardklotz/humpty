/*
 Source File : UsedFontDriver.h
 
 
 Copyright 2013 Gal Kahana HummusJS
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 
 */
#pragma once

#include "nodes.h"
#include "PDFTextString.h"

class PDFTextStringDriver : public node::ObjectWrap
{
public:
    static void Init(v8::Handle<v8::Object> inExports);
	static METHOD_RETURN_TYPE NewInstance(const ARGS_TYPE& args);
	static v8::Handle<v8::Value> GetNewInstance(const ARGS_TYPE& args);
    
private:
    PDFTextString mTextString;
    
    static v8::Persistent<v8::Function> constructor;
	static METHOD_RETURN_TYPE New(const ARGS_TYPE& args);
	static METHOD_RETURN_TYPE ToBytesArray(const ARGS_TYPE& args);
	static METHOD_RETURN_TYPE ToString(const ARGS_TYPE& args);
	static METHOD_RETURN_TYPE FromString(const ARGS_TYPE& args);
    
};