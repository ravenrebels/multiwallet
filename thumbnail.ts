//@ts-ignore
import * as imageThumbnail from "image-thumbnail";
import * as blockchain from "./blockchain/blockchain";
import * as fs from "fs";
import axios from "axios";
import * as path from "path";
import { Request, Response, Application, Express } from "express";



type StringStringMapper = {
  [key: string]: string;
};
let ipfsByAssetName: StringStringMapper = {};
let blockedIPFS: StringStringMapper = {};

const HOUR = 3600000;
const MINUTE = 60 * 1000;
//Clear asset name > ipfs hash cache very X minutes
setInterval(function () {
  ipfsByAssetName = {};
}, 3 * MINUTE); //Clear IPFS > asset mapping more often than blocked ipfs, since we can reissue assets/change ipfs
setInterval(function () {
  blockedIPFS = {};
}, HOUR);

/*
  Summary
  Get meta data for asset, to get IPFS cid (hash).
  Check with IPFS Gateway (HTTP Head) the content type and size of the object.
  IPFS can point to anything, could be a 10gb movie or a pdf
 
  Happy flow - data not cached

  - check meta data for asset X
  - validate that conten type is image and size less than X mb.
  - write contentType to disk in file *IPFS*_contentype
  - generate thumbnail and write binary to *ipfs* file
  - respond with image to 


  Happy flow - data cached
  - check in memory cache (map) if we have IPFS for asset
  - check if file *ipfs*_contentype content say image
  - return image to user

  Odd case


*/

interface IAssetData {
  name: string;
  amount: number;
  units: number;
  reissuable: number;
  has_ipfs: number;
  ipfs_hash: string;
}





const dir = path.resolve("./images");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

export default async function thumbnail(request: Request, response: Response) {
  
  //VALIDATE THAT WE HAVE ASSET NAME
  const assetName = request.query.assetName;
  if (!assetName) {
    response.status(400).send({ error: "No assetName query parameter" });
    return;
  }

  //GET IPFS FOR ASSET IF NOT CACHED
  let ipfs = ipfsByAssetName[assetName + ""];
  try {
    if (!ipfs) {
      const data: IAssetData = await blockchain.getAssetData(assetName + "");
      if (data) {
        ipfs = data.ipfs_hash;
        ipfsByAssetName[assetName + ""] = ipfs;
      }
    }
  } catch (e) {
    response.set("when", "fetching-asset-metadata");
    response.status(500).send({
      error: "Technical error please try again later",
      description: "" + e,
    });
    return;
  }

  //IF ASSET DO NOT HAVE IPFS, WELL, RETURN
  if (!ipfs) {
    response.status(204).send({ error: `${assetName} cant find IPFS` });
    return;
  }


  //RETURN IF WE HAVE BLOCKED THE IPFS,FOR EXAMPLE IF WE COULD NOT FIND THE CONTENT
  if (blockedIPFS[ipfs]) {
    response.set("c-blocked", "could not get meta info from IPFS");
    response.status(500).send({
      error: "Could not get meta data from IPFS Gateway about " + ipfs,
      description: ipfs + " is blocked for about 60 minutes, try again later",
    });
    return;
  }

  function isImage(contentType: string) {
    const isImage = contentType.indexOf("image") > -1;
    return isImage;
  }

  const contentTypeFilePath = "./images/" + ipfs + "_contentType";
  const contentFilePath = "./images/" + ipfs;

  //CHECK IF WE HAVE ALREADY LOCALLLY STORED THE CONTENT TYPE FOR THIS IPFS
  if (fs.existsSync(contentTypeFilePath)) {
    const contentType = fs.readFileSync(contentTypeFilePath, "utf-8"); 

    //SPECIAL TREATMENT FOR PFS, WELL IT IS NOT A PREVIEW/THUMBNAIL OF THE ACTUAL CONTENT BUT AT LEAST WE SERVER THE USERS A TASTY PDF ICON
    if (contentType === "application/pdf") { 
      //Send PDF icon
      const asdf = fs.readFileSync("./static/images/pdf.png");
      response.set("content-type", "image/png");
      response.set("ipfs", ipfs);
      response.send(asdf);
      return; 
    }

    //NOT AN IMAGE, NOTHING WE CAN DO, RETURN
    if (isImage(contentType) === false) {
      console.log("Return before talking to Ravencoin IPFS");
      response.status(204).send({
        error: "Wrong content type ",
        contentType,
      });
      return;
    }
  }

  //IF FILE IS ALREADY STORED LOCALLY (AS THUMBNAIL) RETURN IT
  if (fs.existsSync(contentFilePath)) {
    response.set("c-from-cache", "true");

    try {
      const contentType = fs.readFileSync(contentTypeFilePath, "utf-8");
      response.set("content-type", contentType);
    } catch (e) {
      //If problem with the content type file, delete it
      fs.rmSync(contentTypeFilePath, {
        force: true,
      });
    }

    response.set("ipfs", ipfs);
    response.send(fs.readFileSync(contentFilePath));
    return;
  }

  console.log("Do NOT have info for", ipfs, assetName, "asking Ravencoin IPFS");
  response.set("fetch-ipfs", "fetching asset from IPFS");
  
  //Ask ravencoinipfs for size
  const url = "https://ravencoinipfs-gateway.com/ipfs/" + ipfs;

  try {
    const config = {
      timeout: 10000, //10 seconds timeout
    };
    const asdf = await axios.head(url, config);
    console.log(asdf.headers);
    const size = parseInt("" + asdf.headers["content-length"]);
    const contentType: string = asdf.headers["content-type"] + "";

    fs.writeFileSync(contentTypeFilePath, contentType || "EMPTY");


    //Cache content type
    if (isImage(contentType) === false) {
      response.status(400).send({
        error: "Not an image",
        contentType,
      });
      return;
    }

    response.set("c-exists-on-disk", "" + fs.existsSync(contentFilePath));
    if (fs.existsSync(contentFilePath) === true) {
      const asdf = fs.readFileSync("./images/" + ipfs);
      response.set("content-type", contentType);
      response.set("from-cache", "true");
      response.set("ipfs", ipfs);
      response.send(asdf);
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (size < MAX_SIZE) {
      const options = {
        width: 300,
      };

      //Fetch the binary data for the image from IPFS
      const thumbnail = await imageThumbnail({ uri: url }, options);

      fs.writeFileSync(contentFilePath, thumbnail);
      fs.writeFileSync(contentTypeFilePath, contentType);
      response.set("content-type", contentType);
      response.set("ipfs", ipfs);
      response.send(thumbnail);
      return;
    } else {
      response.status(400).send({
        error: "Content to large",
        "content-length": size,
        "max-size": MAX_SIZE,
      });
    }
    response.send(size);
  } catch (e) {
    console.dir(e + "");
    blockedIPFS[ipfs] = "" + new Date().getMilliseconds();
    response.status(500).send({ error: e + "" });
    return;
  }
}
