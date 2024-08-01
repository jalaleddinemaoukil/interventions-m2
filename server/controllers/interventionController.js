const Intervention = require("../models/Intervention");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  const messages = await req.flash("info");

  const locals = {
    title: "NodeJs",
    description: "Free NodeJs User Management System",
  };

  let perPage = 12;
  let page = req.query.page || 1;

  try {
    const interventions = await Intervention.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Intervention.countDocuments({});

    res.render("index", {
      locals,
      interventions,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

/**
 * GET /
 * About
 */
exports.about = async (req, res) => {
  const locals = {
    title: "About",
    description: "Free NodeJs User Management System",
  };

  try {
    res.render("about", locals);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

/**
 * GET /
 * New Intervention Form
 */
exports.addIntervention = async (req, res) => {
  const locals = {
    title: "Add New Intervention - NodeJs",
    description: "Free NodeJs User Management System",
  };

  res.render("Intervention/add", locals);
};

/**
 * POST /
 * Create New Intervention
 */
exports.postIntervention = async (req, res) => {
  const newIntervention = new Intervention({
    interventionTitre: req.body.interventionTitre,
    nomSociete: req.body.nomSociete,
    telSociete: req.body.telSociete,
    email: req.body.email,
    address: req.body.address,
    ville: req.body.ville,
    details: req.body.details
  });

  try {
    await newIntervention.save();
    await req.flash("info", "New Intervention has been added.");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(400).send('Error: ' + error.message);
  }
};

/**
 * GET /
 * Intervention Data
 */
exports.view = async (req, res) => {
  try {
    const intervention = await Intervention.findOne({ _id: req.params.id });

    const locals = {
      title: "View Intervention Data",
      description: "Free NodeJs User Management System",
    };

    res.render("Intervention/view", {
      locals,
      intervention,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send('Intervention Not Found');
  }
};

/**
 * GET /
 * Edit Intervention Form
 */
exports.edit = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);

    const locals = {
      title: "Edit Intervention Data",
      description: "Free NodeJs User Management System",
    };

    res.render("Intervention/edit", {
      locals,
      intervention,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send('Intervention Not Found');
  }
};

/**
 * POST /
 * Update Intervention Data
 */
exports.editPost = async (req, res) => {
  try {
    await Intervention.findByIdAndUpdate(req.params.id, {
      interventionTitre: req.body.interventionTitre,
      nomSociete: req.body.nomSociete,
      telSociete: req.body.telSociete,
      email: req.body.email,
      address: req.body.address,
      ville: req.body.ville,
      details: req.body.details,
      updatedAt: Date.now()
    });
    res.redirect(`/view/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.status(400).send('Error: ' + error.message);
  }
};

/**
 * DELETE /
 * Delete Intervention Data
 */
exports.deleteIntervention = async (req, res) => {
  try {
    await Intervention.deleteOne({ _id: req.params.id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(400).send('Error: ' + error.message);
  }
};

/**
 * POST /
 * Search Intervention Data
 */
exports.searchInterventions = async (req, res) => {
  const locals = {
    title: "Search Intervention Data",
    description: "Free NodeJs User Management System",
  };

  try {
    let searchTerm = req.body.searchTerm || '';
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const interventions = await Intervention.find({
      $or: [
        { nomSociete: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { details: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      interventions,
      locals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


// Ensure the `tmp` directory exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * GET /export/:id
 * Export Intervention as PDF
 */
exports.exportPDF = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);

    if (!intervention) {
      return res.status(404).send('Intervention not found');
    }

    const tmpDir = path.join(__dirname, '../tmp');
    ensureDirExists(tmpDir); // Ensure the tmp directory exists

    const doc = new PDFDocument();
    const filePath = path.join(tmpDir, `${intervention._id}.pdf`);

    // Pipe the PDF into a file
    doc.pipe(fs.createWriteStream(filePath));

    // Add content to the PDF
    doc.fontSize(25).text(`Intervention Report`, {
      align: 'center'
    });

    doc.moveDown();

    doc.fontSize(18).text(`Title: ${intervention.interventionTitre}`);
    doc.fontSize(14).text(`Company: ${intervention.nomSociete}`);
    doc.text(`Telephone: ${intervention.telSociete}`);
    doc.text(`Email: ${intervention.email}`);
    doc.text(`Address: ${intervention.address}`);
    doc.text(`City: ${intervention.ville}`);
    doc.text(`Details: ${intervention.details}`);
    doc.text(`Created At: ${new Date(intervention.createdAt).toLocaleString()}`);
    doc.text(`Updated At: ${new Date(intervention.updatedAt).toLocaleString()}`);

    doc.end();

    // Wait for the file to be written, then send it to the client
    doc.on('finish', () => {
      res.download(filePath, `${intervention._id}.pdf`, (err) => {
        if (err) {
          console.log(err);
        } else {
          // Optionally, remove the file after download
          fs.unlink(filePath, (err) => {
            if (err) console.log(err);
          });
        }
      });
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};
