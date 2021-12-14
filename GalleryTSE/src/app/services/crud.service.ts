import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';



//@Injectable({
//  providedIn: 'root'
//})

export class CrudService {

  private dbInstance: SQLiteObject;
  readonly db_name: string = 'remotestack.db';
  readonly photo_table: string = 'photoTable';
  readonly photomot_table: string = 'photo_motTable';
  readonly mot_table: string = 'motTable';

  readonly photoInfo_table:string = 'photo_infoTable';

  readonly licence_table:string = 'licenceTable';
  readonly auteur_table:string = 'auteurTable';
  readonly projet_table:string = 'projetTable';
  USERS: string[];

  constructor(
    private platform: Platform,
    private sqlite: SQLite
  ) {
    this.databaseConn();

  }

    // Create SQLite database
    async databaseConn() {
        await this.platform.ready().then(() => {
          this.sqlite.create({
              name: this.db_name,
              location: 'default'
            }).then((sqLite: SQLiteObject) => {
              this.dbInstance = sqLite;
              sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.photo_table} (
                    photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url varchar(255),
                    taille varchar(255),
                    poids varchar(255),
                    UNIQUE(url)
                  )`
                  , []).then((res) => {
                    // alert(JSON.stringify(res));
                  })
                  .catch((error) => alert('ERROR ON CREATE PRIMARY TABLE'+JSON.stringify(error)));
                  sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.mot_table} (
                    mot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mot varchar(255),
                    unique(mot)
                  )`
                  , []).then((res) => {
                    // alert(JSON.stringify(res));
                  })
                  .catch((error) => alert('ERROR ON CREATE 2nd TABLE'+JSON.stringify(error)));
                  //Create PhotoMot Table
                  sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.photomot_table} (
                    photomot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    photo_id INTEGER,
                    mot_id INTEGER,
                    FOREIGN KEY(photo_id) REFERENCES ${this.photo_table}(photo_id),
                    FOREIGN KEY(mot_id) REFERENCES ${this.mot_table}(mot_id),
                    UNIQUE(photo_id,mot_id)
                  )`
                  , []).then(() => {
                    // alert ('SUCESS TO CREATE KEYWORD TABLE)
                  }).catch((error) => alert('ERROR ON CREATE 3rd TABLE'+JSON.stringify(error)));

                  // Create Licence Table
                  sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.licence_table} (
                    licence_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    licence varchar(255),
                    unique(licence)
                  )`
                  , []).then((res) => {
                    // alert(JSON.stringify(res));
                  })
                  // Create Auteur Table
                  sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.auteur_table} (
                    auteur_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    auteur varchar(255),
                    unique(auteur)
                  )`
                  , []).then((res) => {
                    // alert(JSON.stringify(res));
                  })
                  // Create Projet Table
                  sqLite.executeSql(`
                  CREATE TABLE IF NOT EXISTS ${this.projet_table} (
                    projet_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    projet varchar(255),
                    unique(projet)
                  )`
                  , []).then((res) => {
                    // alert(JSON.stringify(res));
                  })


                    /*
                     * Create photoInfo Table for information provided by API
                     */
                    sqLite.executeSql(`
                      CREATE TABLE IF NOT EXISTS ${this.photoInfo_table} (
                        photoInfoId INTEGER PRIMARY KEY AUTOINCREMENT,
                        photo_id INTEGER,
                        licence_id INTEGER,
                        auteur_id INTEGER,
                        projet_id INTEGER,
                        FOREIGN KEY (photo_id) REFERENCES ${this.photo_table} (photo_id),
                        FOREIGN KEY (licence_id) REFERENCES ${this.licence_table} (licence_id),
                        FOREIGN KEY (auteur_id) REFERENCES ${this.auteur_table} (auteur_id),
                        FOREIGN KEY (projet_id) REFERENCES ${this.projet_table} (projet_id),
                        UNIQUE (photo_id,licence_id,auteur_id,projet_id)

                      )`
                  , []).catch((e)=>{/*alert('ERROR TO CREATE PHOTO INFO TABLE'+JSON.stringify(e))*/;})
                  .then(()=>{ /* alert('Sucess To add photoinfoTable');*/})

            })
            .catch((error) => alert('ERROR ON Dataconn TABLE'+JSON.stringify(error)));
        });
    }

    // Crud
    public addPhoto(url) {
      // validation
      if (!url.length) {
       // alert('Provide an url not nul');
        return;
      }
      this.dbInstance.executeSql(`
      INSERT INTO ${this.photo_table} (url) VALUES ('${url}')`, [])
        .then(() => {
         //  alert("Success add Photo");
         // this.getAllPhotos();
        }, (e) => {
          // alert('ERROR ON ADD PHOTOURL '+JSON.stringify(e));
        });
    }

    async addPoidsToExistingPhoto(url: string,poids:string){
      await this.dbInstance.executeSql(`
      UPDATE ${this.photo_table}
      SET poids= '${poids}'
      WHERE url= '${url}'
      `,[]).catch((e)=>{/*alert('error on add poids '+JSON.stringify(e))*/;})
    }
   async addTailleToExistingPhoto(url:string,taille:string){
      await this.dbInstance.executeSql(`
      UPDATE ${this.photo_table}
      SET taille= '${taille}'
      WHERE url= '${url}'
      `,[]).catch((e)=>{/*alert('error on update taille '+JSON.stringify(e));*/})
    }
    public async addKeyword(keyword) {
      // validation
      if (keyword.length===0) {
         //alert('Provide a keyword');
        // do nothing
        return;
      }
      //alert('KEYWORD= '+keyword);
      this.dbInstance.executeSql(`
      INSERT INTO ${this.mot_table} (mot) SELECT ('${keyword}') WHERE NOT EXISTS (
        SELECT 1 FROM ${this.mot_table} WHERE mot LIKE '%${keyword}%'
      )`, [])
        .then(() => {
          // alert("Success add KeyWords");
        }, (e) => {
         // alert('Error on INSERT '+JSON.stringify(e));
        });
    }
    async addLicence(licence:string){
      if (licence === undefined || licence===null){
       // alert('fail licence');
        return;
      }
      this.dbInstance.executeSql(
        `
        INSERT INTO ${this.licence_table} (licence) SELECT ('${licence}') WHERE NOT EXISTS (
          SELECT 1 FROM ${this.licence_table} WHERE licence LIKE '%${licence}%'
        )
      ` ,[])
    }

    async addProjet(projet:string){
      if (projet===undefined || projet===null){
      //  alert('PROJET NULL')
        projet='no projet';
      }
      this.dbInstance.executeSql(
        `
        INSERT INTO ${this.projet_table} (projet) SELECT ('${projet}') WHERE NOT EXISTS (
          SELECT 1 FROM ${this.projet_table} WHERE projet LIKE '%${projet}%'
        )
      ` ,[]).catch((e)=>{/*alert('Fail to add projet '+JSON.stringify(e));*/})
    }
    async addAuteur(auteur:string){
      if (auteur===undefined || auteur===null){
        auteur='no auteur'
      }
      this.dbInstance.executeSql(
        `
        INSERT INTO ${this.auteur_table} (auteur) SELECT ('${auteur}') WHERE NOT EXISTS (
          SELECT 1 FROM ${this.auteur_table} WHERE auteur LIKE '%${auteur}%'
        )
      ` ,[]).catch((e)=>{/*alert('Fail to add auteur '+JSON.stringify(e))*/;})
    }
    async addLicencetoPhoto(url:string,licence:string){
      await this.addLicence(licence);
      const licenceid=await this.getLicenceId(licence);
      const id=await this.getIdPhoto(url);

      await this.dbInstance.executeSql(`
      UPDATE ${this.photoInfo_table}
      SET licence_id = ${licenceid}
      WHERE photo_id=${id}
      `,[]).catch((e)=>{
       /* alert('pb Licence = '+JSON.stringify(e))*/;
      });
    }
    async addProjetToPhoto(url:string,projet:string){
      await this.addProjet(projet);
      const projetiD= await this.getProjetId(projet);
      const id=await this.getIdPhoto(url);
      await this.dbInstance.executeSql(`
      UPDATE ${this.photoInfo_table}
      SET projet_id = ${projetiD}
      WHERE photo_id=${id}
      `,[]).catch((e)=>{/*alert('projet no update'+JSON.stringify(e))*/;})
      .then(()=>{/*alert('okok Porjet')*/});
    }
    async addAuteurToPhoto(url:string,auteur:string){
      await this.addAuteur(auteur);
      const auteuriD=await this.getAuteurId(auteur);
      const id=await this.getIdPhoto(url);
      await this.dbInstance.executeSql(`
      UPDATE ${this.photoInfo_table}
      SET auteur_id = ${auteuriD}
      WHERE photo_id=${id}
      `,[]);
    }
    // link licence to a photo
    async addInformationToPhoto(url:string,licence:string,auteur:string, projet:string){
      // Créé le lien entre les infos présentent dans leurs tables respectives et l'image auquelle ils sont associés
      if (url===null ||url === undefined||licence===null ||licence === undefined
        ||auteur===null ||auteur === undefined||projet===null ||projet=== undefined){
        //  alert('pas top : url = '+url+ ' licence= '+licence+ ' auteur = '+auteur+' projet= '+projet);
        if(licence===undefined){
          licence = 'no licence';
        }
        if(auteur===undefined){
          auteur='no author'
        }
        if(projet===undefined){
          projet='no project';
        }
        if(url===undefined){
         // alert('url no defined');
        }
     }
     const id=await this.getIdPhoto(url);
     const licenceid=await this.getLicenceId(licence);
     const auteuriD=await this.getAuteurId(auteur);
     const projetiD= await this.getProjetId(projet);
     // alert('id= '+id+' licence= '+licenceid+' auteur= '+auteuriD+' projet= '+projetiD);
     this.dbInstance.executeSql(`
     INSERT INTO ${this.photoInfo_table} (photo_id,licence_id,auteur_id,projet_id) SELECT '${id}','${licenceid}','${auteuriD}','${projetiD}'
     WHERE NOT EXISTS(
       SELECT 1 FROM ${this.photoInfo_table} WHERE
       photo_id ='${id}' AND licence_id = '${licenceid}'AND auteur_id = '${auteuriD}' AND projet_id ='${projetiD}'
     )
     `,[]).then(()=>{console.log('SUcess to add licence to photo'); })
     .catch((e)=>{/*alert('Fail to add information to photo '+JSON.stringify(e))*/;});
    }
    async updateInformationToPhoto(url:string,CV:string[]){
      // alert('CV= '+CV);
      await this.addPoidsToExistingPhoto(url,CV[0]);
      // alert('poids ok');
      await this.addTailleToExistingPhoto(url,CV[1]);
      // alert('taille ok');
      await this.addLicencetoPhoto(url,CV[2]);
      // alert('licence ok');
      await this.addAuteurToPhoto(url,CV[3]);
      // alert('auteur ok');
      await this.addProjetToPhoto(url,CV[4]);
      // alert('Projet ok');
// Je ne laisse pas l'autorisation à l'utilisateur de changer le fileLocation
    }

     // Add a keyword to a photo
    /* async addKeywordToPhoto(id,keyword){
      let mot_id=null;
      if (id<0 || keyword.length===0 ) {
        // alert('Provide a valide id and keyword : id ='+id+' key = '+ keyword);
       // alert('Id length = '+ id+ ' Keyword = '+keyword.length);
        return;
      }
      const photo=await this.dbInstance.executeSql(`SELECT * FROM ${this.photo_table} WHERE photo_id = ?`, [id]).then((res)=>{return res;})
      if(photo==null){
        // alert('Photo id does not exist');
        return;
      }
        this.dbInstance.executeSql(`
        SELECT mot_id FROM ${this.mot_table} WHERE mot = ('${keyword}')
        `, []).then((res) => {
          mot_id=res.rows.item(0).mot_id;
        //  alert('motId = '+ mot_id);
        this.dbInstance.executeSql(`
        INSERT INTO ${this.photomot_table}(photo_id,mot_id) VALUES ('${id}','${mot_id}');
        `, [])
        .then(() => {
          // alert("Success = "+keyword);
          // this.getAllPhotos();
        }, (e) => {
          alert('ERROR ON ADD KEYORD TO PHOTO '+JSON.stringify(e));
        });

        });
          INSERT INTO ${this.auteur_table} (auteur) SELECT ('${auteur}') WHERE NOT EXISTS (
          SELECT 1 FROM ${this.auteur_table} WHERE auteur LIKE '%${auteur}%'
    }*/
    async addKeywordToPhoto(id,keyword){
     // alert('id= '+ id+ ' keyword = '+keyword);
      const mot_id=await this.getIdKeywordByKeyword(keyword);
    //  alert('mot_id = '+mot_id);
      await this.dbInstance.executeSql(`
      INSERT INTO ${this.photomot_table} (photo_id,mot_id) SELECT ${id},${mot_id} WHERE NOT EXISTS (
        SELECT 1 FROM ${this.photomot_table} WHERE photo_id =${id} AND mot_id = ${mot_id}
      )
      `, []).then(()=>{ /*alert('keyword okok : '+keyword);*/})
      .catch((e)=>{/*alert('ADDKEYWORDTO PHOTO ERROR '+JSON.stringify(e));*/});
    }

async removeKeywordFromPhoto(url:string,keyword:string){
//   alert('url= '+url+' keyword= '+keyword);
  const idPhoto= await this.getIdPhoto(url);
 //  alert('idphoto ='+idPhoto);
  const idKeyword= await this.getIdKeywordByKeyword(keyword) ;
 //  alert('iDKeyword= '+idKeyword);

  const idPhotoMot=await this.getPhotoModId(idPhoto,idKeyword);
  // alert('idPhotoMOt= '+idPhotoMot);

  await this.dbInstance.executeSql(`
  DELETE FROM ${this.photomot_table} WHERE photomot_id= ${idPhotoMot};
  `,[]);
}
async removeAuteur(auteurId:number){
  await this.dbInstance.executeSql(`
  DELETE FROM ${this.auteur_table} WHERE auteur_id=${auteurId}
  `,[]);
}
async removeLicence(licenceId:number){
  await this.dbInstance.executeSql(`
  DELETE FROM ${this.licence_table} WHERE licence_id=${licenceId}
  `,[]).catch((e)=>{
    console.log('remove licence pas ok'+JSON.stringify(e));
  });
}
async removeProjet(projetId:number){
  await this.dbInstance.executeSql(`
  DELETE FROM ${this.projet_table} WHERE projet_id=${projetId}
  `,[]);
}
async getPhotoModId(idPhoto:number,idMot:number):Promise<number>{
  return await this.dbInstance.executeSql(`
  SELECT photomot_id FROM ${this.photomot_table} WHERE photo_id=${idPhoto} AND mot_id=${idMot}
  `,[]).then((res)=>{
    return res.rows.item(0).photomot_id;
  })
}
async getIdKeywordByKeyword(keyword:string){
  /**
   * Cela peut paraître bizarre, mais pour prévenir que l'utilisateur n'ai pas mit de mot clefs
   * entre quotes : ex :"Loire" au lieu de Loire, le OR permet de facilement contourner ce souci
   */
 // alert('getIDBYK : K= '+keyword);
  return await this.dbInstance.executeSql(`
  SELECT mot_id FROM ${this.mot_table} WHERE mot = "${escape(keyword)}" OR mot= "${escape(keyword)}" LIMIT 1
  `,[]).then((res)=>{
    if(res!==undefined){
      if(res.rows.length>0){
     //   alert('getidkeywordbykeyword '+typeof(res.rows.item(0).mot_id));
    return res.rows.item(0).mot_id;
      }
    }
    else{
      return 0;
    }

  })
}
    async getAllPhotos(){
      //alert("Je suis dans get All");
      /**
       * ATTENTION ! ICI ON est dans la version hybride !! Faire attention!
       */
      return await this.dbInstance.executeSql(`
      SELECT url FROM ${this.photo_table}`, []).then((res) => {
        this.USERS  = [];
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
           // const url = Capacitor.convertFileSrc(res.rows.item(i).url);
            this.USERS.push(res.rows.item(i).url);
          }
          return this.USERS;

        }
      }).then((res) => {
        //  alert('SUcess to get all');
        return res;
      }).catch((e)=>{
       // alert('Erreur lors de la requete de toutes les images '+ JSON.stringify(e));
        const err:string[]=[];
        return err;
      })
    }

    // Get photo
    async getPhoto(id): Promise<any> {
      return await this.dbInstance.executeSql(`SELECT url FROM ${this.photo_table} WHERE photo_id = ?`, [id])
      .then((res) => {
        //alert("URL= "+res);
        return res;
      }).catch((e)=>{
      //  alert('ERROR ON get id'+JSON.stringify(e));
      });
    }


    async getIdPhoto(url:string):Promise<number>{
      if ( url ===undefined||url===null){
        // alert ('URL IS undefined or null : '+url);
        return -1;
      }
      if(url.length===0){
      // alert('Provide a non null URL length');
        return -1;
      }
      return await  this.dbInstance.executeSql(
        `SELECT photo_id FROM ${this.photo_table} WHERE url ="${url}"`,
        []).then((res)=>{
        // alert('idIntosql = '+ res.rows.item(0).photo_id);
        return res.rows.item(0).photo_id;
      }).catch((e) =>{
       //  alert('ERROR ON GET IDPHOTO'+JSON.stringify(e));
        return 0;
      });

    }
    async deletePicture(id:number) /**  suppression id url et correspondance */
    {
      if(id!==0){
      await this.dbInstance.executeSql(`
      DELETE FROM ${this.photo_table} WHERE photo_id = ${id}
      `,[]).catch((e)=>{ /*('ERROR ON SUPRESSION OF PHOTOTABLE'+JSON.stringify(e));*/})
      .then(()=>{
        this.dbInstance.executeSql( `
        DELETE FROM ${this.photomot_table} WHERE photo_id= ${id};
        `,[]);
      }).catch((e)=>{/*alert('ERROR ON SUPRESSION OF PHOTOMOTABLE '+JSON.stringify(e));*/})
      .then(()=>{
       // alert('delete success photo '+ id);
      }).catch((e)=>{
       /* alert ('ERROR ON DELETE PICTURE '+JSON.stringify(e));*/
      })
    }
  }
    async getKeyword(url):Promise<string[]> {
      return  await this.dbInstance.executeSql(`
    select mot from ${this.mot_table}
    INNER JOIN ${this.photomot_table} on photo_motTable.mot_id= motTable.mot_id
    INNER JOIN ${this.photo_table} on photoTable.photo_id=photo_motTable.photo_id
    where url ="${url}"
      `,[]).then((result)=>{
        //alert('result keyword = '+result)
        if(result!==undefined){
          let res=[];
          for (let i = 0; i < result.rows.length; i++) {
           // alert('Mot clefs: '+result.rows.item(i).mot)
             res.push(unescape(result.rows.item(i).mot));
           }
           return res;
        }

       // alert('undefine');
        return  ['undefined'];
      }).catch((e)=>{
      //  alert('ERROR ON GETKEYWORD '+JSON.stringify(e));
        return ['error'];
      });
    }
    async getPictureByKeywords(keyword:string): Promise<string[]>  {
      return await this.dbInstance.executeSql(
        `
        SELECT DISTINCT url from photoTable
        INNER JOIN photo_motTable on photo_motTable.photo_id= photoTable.photo_id
        INNER JOIN motTable on motTable.mot_id = photo_motTable.mot_id
        WHERE motTable.mot LIKE "%${keyword}%"
        `
      ,[]).then((res) => {
        const ListUrl  : string[]=[];
        if (res.rows.length > 0) {
        //  alert('je suis dans le IF');
          for (let i = 0; i < res.rows.length; i++) {
          //  alert ('res.rows.item(i).url = '+res.rows.item(i).url);
            ListUrl.push(res.rows.item(i).url);
          }
        }else{
            ListUrl.push(''); // je push une chaine de caractère vide pour ne pas avoir de undefined
          }
        return ListUrl;

    }).catch((e)=>{
      const ListUrl  : string[]=[];
     // alert ('ERROR ON GET PICTURE BY KEYWORD '+JSON.stringify(e));
      return ListUrl;

    })
  }
  async getLicenceId(licence:string) :Promise<number>{
    return await this.dbInstance.executeSql(`
    SELECT licence_id FROM ${this.licence_table} WHERE licence= "${licence}"
    `,[]).then((res)=>{
      if(res===undefined){
        alert('undefined licence');
        return -1;
      }
     // alert('idLicence='+res.rows.item(0).licence_id);
      return res.rows.item(0).licence_id;
    })
    .catch((e)=>{/*alert('Fail to get Licence '+JSON.stringify(e))*/;});
  }
  async getAuteurId(auteur:string):Promise<number>{
   // alert('Autheur ='+auteur);
    return await this.dbInstance.executeSql(`
    SELECT auteur_id FROM ${this.auteur_table} WHERE auteur = "${auteur}"
    `,[]).then((res)=>{
      if(res===undefined){
    //    alert('undefined auteur');
        return -2;
      }
     //  alert('idAuteur='+ res.rows.item(0).auteur_id);
      return res.rows.item(0).auteur_id;
    }).catch((e)=>{
    //  alert('getAuteur id fail: '+JSON.stringify(e));
      return -1;
    });
  }
  async getProjetId(projet:string):Promise<number>{
    return await this.dbInstance.executeSql(`
    SELECT DISTINCT projet_id FROM ${this.projet_table} WHERE projet= "${projet}"
    `,[]).then((res)=>{
      if(res===undefined){
      //  alert('undefined projet');
        return -1;
      }
      else{
        if(res.rows.length>0){
          return res.rows.item(0).projet_id;
        }
      }
      return 0;
     // alert ('projet id = '+res.rows.item(0).projet_id);

    });
  }
  async getTaillePhoto(url:string) :Promise<string>{
    return await this.dbInstance.executeSql(`
    SELECT taille FROM ${this.photo_table} WHERE url="${url}";
    `,[]).then((res)=>{
      if(res===undefined){
      //  alert('undefined taille');

        return 'UNDEFINED';
      }
     // alert ('taille photo = '+res.rows.item(0).taille);
      return res.rows.item(0).taille;
    });
  }
  async getPoidsPhoto(url:string): Promise<string>{
    return await this.dbInstance.executeSql(`
    SELECT poids FROM ${this.photo_table} WHERE url = "${url}";
    `,[]).then((res)=>{
      if(res===undefined){
        return 'UNDEFINED';
      }
      return res.rows.item(0).poids;
    });
  }
  async getLicenceById(id):Promise<string>{
    return await this.dbInstance.executeSql(`
    SELECT licence FROM ${this.licence_table} WHERE licence_id=${id};
    `,[]).then((res)=>{
      if(res===undefined){
        return 'UNDEFINED';
      }
      return res.rows.item(0).licence;
    });
  }

  async getauteurById(id){
    return await this.dbInstance.executeSql(`
    SELECT auteur FROM ${this.auteur_table} WHERE auteur_id=${id};
    `,[]).then((res)=>{
      if(res===undefined){
        return 'UNDEFINED';
      }
      return res.rows.item(0).auteur;
    });
  }

  async getProjetById(id){
    return await this.dbInstance.executeSql(`
    SELECT projet FROM ${this.projet_table} WHERE projet_id=${id};
    `,[]).then((res)=>{
      if(res===undefined){
        return 'UNDEFINED';
      }
      return res.rows.item(0).projet;
    });
  }
   getCaracteristicKeys(url:string){
    return ['Poids', 'Taille', 'Licence', 'Auteur', 'Projet', 'fileLocation'];
    // alert('okok '+url);
   /* const id= await this.getIdPhoto(url);
   // alert('id photo ='+id);
    return await this.dbInstance.executeSql(`
    SELECT
    licence_id,
    auteur_id,
    projet_id
    FROM ${this.photoInfo_table}
    WHERE photo_id=${id};
    `,[])
    .then(async (res)=>{
      // Il manque le poids, la taille
     // alert('j'+' ai passé le then')
      const licence= await this.getLicenceById(res.rows.item(0).licence_id);
    //  alert('licence ok '+licence);
     const auteur= await this.getauteurById(res.rows.item(0).auteur_id);
    //  alert('auteur ok '+auteur);
       const projet= await this.getProjetById(res.rows.item(0).projet_id);
    //  alert('projet ok '+projet);
      const poids  = await this.getPoidsPhoto(url);
     // alert('poids ok '+poids);
      const taille= await this.getTaillePhoto(url);
     // alert('taille ok '+taille);
     // alert('resultat caraK= '+[poids,taille,licence,auteur,projet,url]);
      return [poids,taille,licence,auteur,projet,url];
    }).catch((e)=>{
      alert('Error in getCaraKV');
      return [''];
    })*/
  }
  async getCaracteristicValues(url:string):Promise <string[]>{
    return await this.dbInstance.executeSql(
    `
    SELECT
    poids, taille, licence, auteur, projet, url
    FROM ${this.photo_table}
    INNER JOIN ${this.photoInfo_table} ON photo_infoTable.photo_id = photoTable.photo_id
    INNER JOIN ${this.licence_table} ON photo_infoTable.licence_id = licenceTable.licence_id
    INNER JOIN ${this.auteur_table} ON photo_infoTable.auteur_id = auteurTable.auteur_id
    INNER JOIN ${this.projet_table} ON photo_infoTable.projet_id = projetTable.projet_id
    WHERE url = '${url}'
    `,[]).then((res)=>{
    // alert('je suis dans le then'+res.rows.item(0).poids);
      let CV :string[]=[];
      if(res!==undefined){
        if(res.rows.length>0){
          console.log(res);
          if(res.rows.item(0).poids===undefined){
            res.rows.item(0).poids='non renseigné';
          }
          CV[0]=unescape(res.rows.item(0).poids);
          CV[1]=unescape(res.rows.item(0).taille);
          CV[2]=unescape(res.rows.item(0).licence);
          CV[3]=unescape(res.rows.item(0).auteur);
          CV[4]=unescape(res.rows.item(0).projet);
          CV[5]=unescape(res.rows.item(0).url);
          console.log('Carac Values = '+CV);
        }
     //   let item = res.rows.item(0);
      }

      return CV;
    }).catch((e)=>{
      // alert('error dans getCara'+JSON.stringify(e));
       console.log(e);
      return [''];
    });
  }
  /*
  async setCaracteristicKeys(url:string,characteristicsKeys:string[]){
    await this.dbInstance.executeSql(`
    INSERT INTO ${this.photoInfo_table} (photo_id,licence_id,auteur_id,projet_id) VALUES ()
    `,[])
  }*/
   async setCharacteristicsValues(url:string,cV:string[]){
    // update foreign tables
    // alert('setCaracteristic value');
   await this.addPoidsToExistingPhoto(url,cV[0]);
   await  this.addTailleToExistingPhoto(url,cV[1]);
    if(cV[2].length===0){
      cV[2]= 'no licenses';
    }
   await this.addLicence(cV[2]);
   await this.addAuteur(cV[3]);
   await this.addProjet(cV[4]);

  // alert('url,cV[2],cV[3],cV[4] ='+[url,cV[2],cV[3],cV[4]]);
 // await this.updateInformationToPhoto(url,cV);
    await this.addInformationToPhoto(url,cV[2],cV[3],cV[4]);

  }
  async getAllIdAuteurs():Promise<number[]>{
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT auteur_id FROM ${this.auteur_table}
    `,[]).then((res)=>{
      let allId :number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          allId.push(res.rows.item(i).auteur_id);
        }
      }
      return allId;
    })
  }
  async getAllIdLicences():Promise<number[]>{
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT licence_id FROM ${this.licence_table}
    `,[]).then((res)=>{
      let allId :number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          allId.push(res.rows.item(i).licence_id);
        }
      }
      return allId;
    })
  }
  async getAllIdProjets():Promise<number[]>{
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT projet_id FROM ${this.projet_table}
    `,[]).then((res)=>{
      let allId :number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          allId.push(res.rows.item(i).projet_id);
        }
      }
      return allId;
    })
  }
  async getAllLicences() :Promise<string[]>{
    return await this.dbInstance.executeSql(`
    SELECT licence FROM ${this.licence_table}
    `,[]).catch((e)=>{/*alert('ERROR get licence '+JSON.stringify(e));*/})
    .then((res)=>{
    //  alert(res.rows.item(0).licence);
    //  alert('length '+res.rows.length);
      let allLicences:string[]= [];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          allLicences.push(res.rows.item(i).licence);
          // alert('licence ='+res.rows.item(i).licence);
        }
      }
      return allLicences;
    })
  }
  async getAllAuteurs() :Promise<string[]>{
    return await this.dbInstance.executeSql(`
    SELECT auteur FROM ${this.auteur_table}
    `,[]).catch((e)=>{/*alert('ERROR get auteur '+JSON.stringify(e));*/})
    .then((res)=>{
    //  alert(res.rows.item(0).licence);
    //  alert('length '+res.rows.length);
      let allAuteurs:string[]= [];
      if(res!==undefined){
       // alert('je suis dans le if');
        for (let i=0;i<res.rows.length;i++){
          allAuteurs.push(res.rows.item(i).auteur);
        //  alert('auteur ='+res.rows.item(i).auteur);
        }
      }
    //  alert('crud get all auteur = '+allAuteurs);
      return allAuteurs;
    })
  }
  async getAllProjets() :Promise<string[]>{
    return await this.dbInstance.executeSql(`
    SELECT projet FROM ${this.projet_table}
    `,[]).catch((e)=>{/*alert('ERROR get projet '+JSON.stringify(e));*/})
    .then((res)=>{
    //  alert(res.rows.item(0).licence);
    //  alert('length '+res.rows.length);
      let allProjets:string[]= [];
      if(res!==undefined){
       // alert('je suis dans le if');
        for (let i=0;i<res.rows.length;i++){
          allProjets.push(res.rows.item(i).projet);
        //  alert('auteur ='+res.rows.item(i).auteur);
        }
      }
    //  alert('crud get all auteur = '+allProjets);
      return allProjets;
    })
  }
  async getAllIdAuteurFromPhotoInfo():Promise<number[]> {
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT DISTINCT auteur_id FROM ${this.photoInfo_table}
    `,[]).then((res)=>{
      let AllId:number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          AllId.push(res.rows.item(i).auteur_id);
        }
      }
      return AllId;
    })
  }
  async getAllIdLicenceFromPhotoInfo():Promise<number[]> {
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT DISTINCT licence_id FROM ${this.photoInfo_table}
    `,[]).then((res)=>{
      let AllId:number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          AllId.push(res.rows.item(i).licence_id);
        }
      }
      return AllId;
    })
  }
  async getAllIdProjetFromPhotoInfo():Promise<number[]> {
    // Utile pour la méthode VerifyDataToDelete
    return await this.dbInstance.executeSql(`
    SELECT DISTINCT projet_id FROM ${this.photoInfo_table}
    `,[]).then((res)=>{
      let AllId:number[]=[];
      if(res!==undefined){
        for (let i=0;i<res.rows.length;i++){
          AllId.push(res.rows.item(i).projet_id);
        }
      }
      return AllId;
    })
  }
  async searchImageByLicence(licence:string){
    return await this.dbInstance.executeSql(`
        SELECT url from ${this.photo_table}
        INNER JOIN ${this.photoInfo_table} on photo_infoTable.photo_id = photoTable.photo_id
        INNER JOIN ${this.licence_table} on licenceTable.licence_id = photo_infoTable.licence_id
        WHERE licence = "${licence}"
    `,[]).then((res)=>{
      let listOfImages:string[]=[];
      if(res!==undefined){
        for( let i=0;i<res.rows.length;i++){
          listOfImages.push(res.rows.item(i).url);
        }
      }
      return listOfImages;
    })
  }
    async searchImageByAuteur(auteur:string){
    return await this.dbInstance.executeSql(`
        SELECT url from ${this.photo_table}
        INNER JOIN ${this.photoInfo_table} on photo_infoTable.photo_id = photoTable.photo_id
        INNER JOIN ${this.auteur_table} on photo_infoTable.auteur_id = auteurTable.auteur_id
        WHERE auteur = "${auteur}"
    `,[]).then((res)=>{
      let listOfImages:string[]=[];
      if(res!==undefined){
        for( let i=0;i<res.rows.length;i++){
          listOfImages.push(res.rows.item(i).url);
        }
      }
      return listOfImages;
    })
  }
  async searchImageByProjet(projet:string){
    return await this.dbInstance.executeSql(`
        SELECT url from ${this.photo_table}
        INNER JOIN ${this.photoInfo_table} on photo_infoTable.photo_id = photoTable.photo_id
        INNER JOIN ${this.projet_table} on photo_infoTable.projet_id= projetTable.projet_id
        WHERE projet = "${projet}"
    `,[]).then((res)=>{
      let listOfImages:string[]=[];
      if(res!==undefined){
        for( let i=0;i<res.rows.length;i++){
          listOfImages.push(res.rows.item(i).url);
        }
      }
      return listOfImages;
    })
  }
  arr_diff (a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }

    return diff;
}
  async verifyDataToDelete(){
    // Vérifier si les auteurs , projets et licences ne sont pas reliés
    // à une image et donc vont polluer le ion-accordeon
    // Comparer tous les id qui sont assignés à une image à tous les id existant
    // supprimer la différence
    // le DELETE ON CASCADE n'est pas à utiliser car deux images peuvent avoir le même auteur!
    // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript

    /* ----- Partie 1 : les auteurs  ----*/
    const listIdAuteur= await this.getAllIdAuteurs();
    const listIdAuteursInfo=await this.getAllIdAuteurFromPhotoInfo();
  //  alert('lisof AUteur= '+listIdAuteur+' ListAuteur Info = '+listIdAuteursInfo);
    let difference = listIdAuteur
                 .filter(x => !listIdAuteursInfo.includes(x))
    // supprimer la différence de la table.
   // alert('différence Auteur = '+difference)
    if( difference.length >0){
      for (const auteurId of difference){
        if(auteurId!==-1){
          await this.removeAuteur(auteurId);
         // alert('remove auteur'+ auteurId);
        }
      }
    }

        /* ----- Partie 2 : les licences  ----*/
        const listIdLicences= await this.getAllIdLicences();
        const listLicenceInfo=await this.getAllIdLicenceFromPhotoInfo();
        difference = listIdLicences
                     .filter(x => !listLicenceInfo.includes(x))

        // supprimer la différence de la table.
        if(difference.length>0){
       //   alert('Différentce Licence= '+difference);
        //  alert('je suis dans le if');
          for (const licenceId of difference){
            if(licenceId!==-1){
              await this.removeLicence(licenceId);
             // alert('removeLicence '+licenceId);
            }
          }
        }
            /* ----- Partie 3 : les projets  ----*/

/*const idToSave=await this.dbInstance.executeSql(`
            SELECT DISTINCT
            photo_infoTable.projet_id
            FROM
            photo_infoTable
            LEFT JOIN
            projetTable
            ON photo_infoTable.projet_id = projetTable.projet_id
            `,[]).then((res)=>{
              if(res!==undefined){
                let idToSave:number[]=[];
                for(let i=0;i<res.rows.length;i++){
                idToSave.push(res.rows.item(i).projet_id);
                }
                return idToSave;
              }
            });*/
    const listIdProjet= await this.getAllIdProjets();
    const listIdProjetInfo=await this.getAllIdProjetFromPhotoInfo();

   // const differenceP =this.arr_diff(listIdProjet,listIdProjetInfo);
   let differenceP = listIdProjet.filter(x => !listIdProjetInfo.includes(x));
    // alert('diffP'+differenceP);
    // = listIdProjet.filter(x => !idToSave.includes(x));
    console.log('difference '+differenceP);

    // supprimer la différence de la table.
    if(differenceP.length>0){
      for (const projetId of differenceP){
        if(projetId!==-1){
        await this.removeProjet(projetId);
       // alert('remove projet '+ projetId);
        }

      }
    }
  }

}
