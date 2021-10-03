# *FCEditor*: Modeling of Function Choreographies (Serverless Workflows) and building them in AFCL (Abstract Function Choreography Language)

FCEditor is a graphical user interface for building, editing, and exporting function choreographies in AFCL. It offers the FC developers several benefits:

- Builds complex workflows including base functions and compound functions (if, switch, parallel, parallelFor)
- Supports many features of AFCL (constraints, properties, data-flow, control-flow)
- No 'real programming skills' needed for modeling
- Optimization of created workflows

The FCEDitor is accessible at http://fceditor.dps.uibk.ac.at:8180/.

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


## Contributions

Several bachelor theses at the distributed and parallel systems group, department of computer science, University of Innsbruck, supervised by Dr. Sashko Ristov contributed to this project:

- "High-Level Modeling and Low-Level Adaptation of Serverless Function Choreographies", Benjamin Walch, SS2020.
- "Function Choreography Scheduling Framework for Multiple FaaS Systems", Tobias Pockstaller, WS2021.


## Support

If you need any additional information, please do not hesitate to contact sashko@dps.uibk.ac.at.