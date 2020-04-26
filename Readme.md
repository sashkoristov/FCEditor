# Thesis

## Team

**Student**:   
Ben Walch <b.walch@student.uibk.ac.at>  
**Supervisor**:  
Sasko Ristov <sashko@dps.uibk.ac.at>

## Project

### Modeling of Serverless Application Workflows 

"Run code, not Server" is the most recent term of cloud computing providers.
With the rise of the serverless technology during the last years, _FaaS_ became more and more popular.
The Distributed and Parallel Systems Group from University of Innsbruck are doing research in this topic.
One of the results of this research is an API, which was developed for describing serverless application workflows programmatically.
The product which results in using that API is the workflow being described in a generated YAML file.
This file can be further processed by (other) machines.

Until now, the workflow described by the YAML file has to be created manually (by editing the YAML file directly), or a programmer has to write code to get to the final product.
The goal of this thesis is to develop a Graphical User Interface Application which simplifies the process of modeling serverless application workflows.
The developed API of the DPS group will be used as a basic component.
The application would not only be able to model a workflow from scratch, but also loading existing workflows should be supported.
Additionally, one (or both) of the following features will be implemented:
- Optimizing workflows: The application should be able to find the level of paralellism and restructure the workflow accordingly.
- Additional function information: For each function, add additional information (e.g where it is deployed)

### Benefits

- No 'real programming skills' needed for modeling
- Optimization of created workflows

### Development Tasks
- Prototype / Proof-of-concept (Technology choice)
- UI / UX Design
- Representation of existing workflows
- All User Interactions
- Additional Features

## Getting started

### Requirements (Development)

* Java (JDK >= 12)
* Maven
* Node v12

**Install dependencies**  
1. Add AFCL API to local maven repo: `mvn install:install-file -Dfile=./src/main/resources/afclAPI.jar -DgroupId=com.dps.afcl -DartifactId=afcl-api -Dversion=1.0 -Dpackaging=JAR`
2. Install dependencies: `mvn install`  

If using an IDE, reimport - e.g if using IntelliJ:  
right click on Project -> Maven -> Reimport

**Build and run**
1. `mvn compile`
2. `mvn package`
3. `sh target/bin/webapp`

If using an IDE, create a build configuration - e.g if using IntelliJ:  
Run -> Edit Configurations -> Add a configuration and select ``launch.Main`` as main class.

**Frontend**

1. cd into `src/main/webapp`
2. `npm ci` (recommended when package-lock.json present) or `npm i`
3. `npm run dev` or `npm run build`

