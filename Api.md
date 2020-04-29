# AFCL ToolKit API

Documentation

## General

* The API is based on HTTP and is inspired by the principles of REST and RPC.
* Content, which is sent to the API has to be JSON. It is important to set the `Content-Type` HTTP Header to `application/json`.
* Standard HTTP response codes are used for indicating success or failure.
* Currently, there is no active authentication mechanism in order to consume the API.

## Base Endpoint

* The API is available at http://cloudlab.dps.uibk.ac.at:8180/api

## Services

### Workflow Conversion

Converts given workflow to requested format, set in the HTTP `Accept` header.
The workflow to convert is provided in a serialized JSON object in the request data, via the key `"workflow"`

####`[POST] /workflow/convert/fromEditorXml`  
converts given workflow from AFCL ToolKit editor XML to requested type.
Minimal Example:
```
curl -X POST \
  http://localhost:8080/api/workflow/convert/fromEditorXml \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  -d '{"workflow":"<Workflow name=\"MyWorkflow\"><Array as=\"dataIns\" /><Array as=\"dataOuts\" /><Array as=\"body\"><Cell id=\"0\" /><Cell id=\"1\" parent=\"0\" /><Cell id=\"2\" value=\"Start\" style=\"start\" type=\"start\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"292\" y=\"72\" width=\"40\" height=\"40\" as=\"geometry\" /></Cell><Cell id=\"3\" style=\"fn\" type=\"AtomicFunction\" vertex=\"1\" parent=\"1\"><AtomicFunction name=\"HelloWorld\" type=\"HelloWorldType\" as=\"value\"><Array as=\"properties\" /><Array as=\"constraints\" /><Array as=\"dataIns\"><DataIns name=\"Input\" type=\"string\" value=\"Hello World!\"><Array as=\"properties\" /><Array as=\"constraints\" /></DataIns></Array><Array as=\"dataOuts\" /></AtomicFunction><mxGeometry x=\"268\" y=\"156\" width=\"88\" height=\"32\" as=\"geometry\" /></Cell><Cell id=\"4\" style=\"sourcePort=out;targetPort=in;\" edge=\"1\" parent=\"1\" source=\"2\" target=\"3\"><mxGeometry relative=\"1\" as=\"geometry\" /></Cell><Cell id=\"5\" value=\"End\" style=\"end\" type=\"end\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"292\" y=\"236\" width=\"40\" height=\"40\" as=\"geometry\" /></Cell><Cell id=\"6\" style=\"sourcePort=out;targetPort=in;\" edge=\"1\" parent=\"1\" source=\"3\" target=\"5\"><mxGeometry relative=\"1\" as=\"geometry\" /></Cell></Array></Workflow>"}'
```

####`[POST] /workflow/convert/fromYaml`  
converts given AFCL YAML workflow to requested type.
Minimal Example (note that the source YAML string has to be embedded in the request body, which is JSON):
```
curl -X POST \
  http://localhost:8080/api/workflow/convert/fromYaml \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  -d '{"workflow":"---\nname: \"MyWorkflow\"\nworkflowBody:\n- function:\n    name: \"HelloWorld\"\n    type: \"HelloWorldType\"\n    dataIns:\n    - name: \"Input\"\n      type: \"string\"\n      value: \"Hello World!\""}'
```

####`[POST] /workflow/convert/fromJson`
converts given AFCL JSON workflow to requested type.
Minimal example:
```
curl -X POST \
  http://localhost:8080/api/workflow/convert/fromJson \
  -H 'accept: application/x-yaml' \
  -H 'content-type: application/json' \
  -d '{"workflow":{"name":"MyWorkflow","workflowBody":[{"function":{"name": "HelloWorld","type": "HelloWorldType","dataIns":[{"name": "Input","type": "string","value": "Hello World!"}]}}]}}'
```

### Workflow Adaptation

The workflow to adapt is provided in a serialized JSON object in the request data, via the key `"workflow"`,
the adaptations via the key `"adaptations"`.
Currently, the adaptation does a splitting of parallelFor Loops into multiple parallel sections.

####`[POST] /workflow/adapt/fromJson`

Performs the workflow adaptation.  
Minimal example:
```
curl -X POST \
  http://localhost:8080/api/workflow/adapt/fromJson \
  -H 'content-type: application/json' \
  -d '{"adaptations": {"ParallelFor":[{"from":0,"to":1000,"step":1},{"from":1000,"to":2000,"step":1}]},"workflow":{"name":"Untitled","workflowBody":[{"parallelFor":{"name":"ParallelFor","loopCounter":{},"loopBody":[{"function":{"name":"HelloWorld","type":"HelloWorldType"}}]}}]}}'
```
