const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { supabaseAdmin, supabasePublic } = require("./lib/supabase")
const path = require("path") // Import path module

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "ralph-xpert-secret-key-2025"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Générer le fichier VCF à partir de la base de données
async function generateVCF() {
  try {
    const { data: contacts, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Erreur récupération contacts pour VCF:", error)
      return ""
    }

    let vcfContent = ""

    contacts.forEach((contact) => {
      vcfContent += "BEGIN:VCARD\n"
      vcfContent += "VERSION:3.0\n"
      vcfContent += `FN:${contact.nom}\n`
      vcfContent += `TEL:${contact.numero_complet}\n`
      if (contact.email) {
        vcfContent += `EMAIL:${contact.email}\n`
      }
      vcfContent += `NOTE:Inscrit via Ralph Xpert le ${new Date(contact.timestamp).toLocaleDateString("fr-FR")}\n`
      vcfContent += "END:VCARD\n\n"
    })

    console.log(`📞 Fichier VCF généré avec ${contacts.length} contacts`)
    return vcfContent
  } catch (error) {
    console.error("Erreur génération VCF:", error)
    return ""
  }
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" })
    }
    req.user = user
    next()
  })
}

// Routes API

// Connexion admin
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Identifiants par défaut
    const validCredentials = {
      Admin: "Admin",
      admin: "admin",
      ralph: "ralph2025",
    }

    if (validCredentials[username] && validCredentials[username] === password) {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" })

      res.json({
        success: true,
        token,
        user: { username, role: "admin" },
      })
    } else {
      res.status(401).json({ error: "Identifiants incorrects" })
    }
  } catch (error) {
    console.error("Erreur login:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Inscription d'un contact
app.post("/api/contacts", async (req, res) => {
  try {
    const { nom, codePays, numero } = req.body

    if (!nom || !codePays || !numero) {
      return res.status(400).json({ error: "Tous les champs sont requis" })
    }

    const numeroComplet = `${codePays} ${numero}`

    // Vérifier si le numéro existe déjà
    const { data: existingContact } = await supabasePublic
      .from("contacts")
      .select("id")
      .eq("numero_complet", numeroComplet)
      .single()

    if (existingContact) {
      return res.status(409).json({ error: "Ce numéro est déjà inscrit" })
    }

    // Insérer le nouveau contact
    const { data: newContact, error } = await supabasePublic
      .from("contacts")
      .insert([
        {
          nom: nom + " (RXP)",
          numero_complet: numeroComplet,
          code_pays: codePays,
          numero: numero,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Erreur insertion contact:", error)
      return res.status(500).json({ error: "Erreur lors de l'inscription" })
    }

    res.json({
      success: true,
      message: "Contact enregistré avec succès",
      contact: newContact,
    })
  } catch (error) {
    console.error("Erreur inscription:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Récupérer les derniers contacts (pour affichage public)
app.get("/api/contacts/recent", async (req, res) => {
  try {
    const { data: contacts, error } = await supabasePublic
      .from("contacts")
      .select("nom, numero_complet")
      .order("timestamp", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Erreur récupération contacts récents:", error)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    // Compter le total
    const { count, error: countError } = await supabasePublic
      .from("contacts")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Erreur comptage contacts:", countError)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    res.json({
      success: true,
      contacts: contacts || [],
      total: count || 0,
    })
  } catch (error) {
    console.error("Erreur récupération contacts récents:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Envoyer un message de contact
app.post("/api/messages", async (req, res) => {
  try {
    const { nom, email, telephone, sujet, message } = req.body

    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({ error: "Champs requis manquants" })
    }

    const { data: newMessage, error } = await supabasePublic
      .from("messages")
      .insert([
        {
          nom,
          email,
          telephone: telephone || null,
          sujet,
          message,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Erreur insertion message:", error)
      return res.status(500).json({ error: "Erreur lors de l'envoi" })
    }

    res.json({
      success: true,
      message: "Message envoyé avec succès",
      messageId: newMessage.id,
    })
  } catch (error) {
    console.error("Erreur message:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Routes Admin (protégées)

// Récupérer tous les messages
app.get("/api/admin/messages", authenticateToken, async (req, res) => {
  try {
    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Erreur récupération messages:", error)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    res.json({ success: true, messages: messages || [] })
  } catch (error) {
    console.error("Erreur récupération messages:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Récupérer tous les contacts
app.get("/api/admin/contacts", authenticateToken, async (req, res) => {
  try {
    const { data: contacts, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Erreur récupération contacts:", error)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    res.json({ success: true, contacts: contacts || [] })
  } catch (error) {
    console.error("Erreur récupération contacts:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Récupérer un contact spécifique (admin)
app.get("/api/admin/contacts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: contact, error } = await supabaseAdmin.from("contacts").select("*").eq("id", id).single()

    if (error || !contact) {
      return res.status(404).json({ error: "Contact non trouvé" })
    }

    res.json({ success: true, contact })
  } catch (error) {
    console.error("Erreur récupération contact:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Modifier un contact (admin)
app.patch("/api/admin/contacts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { nom, codePays, numero } = req.body

    const numeroComplet = `${codePays} ${numero}`

    // Vérifier si le nouveau numéro existe déjà (sauf pour le contact actuel)
    const { data: existingContact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("numero_complet", numeroComplet)
      .neq("id", id)
      .single()

    if (existingContact) {
      return res.status(409).json({ error: "Ce numéro est déjà utilisé par un autre contact" })
    }

    // Mettre à jour le contact
    const { data: updatedContact, error } = await supabaseAdmin
      .from("contacts")
      .update({
        nom: nom + " (RXP)",
        code_pays: codePays,
        numero,
        numero_complet: numeroComplet,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error || !updatedContact) {
      console.error("Erreur modification contact:", error)
      return res.status(404).json({ error: "Contact non trouvé ou erreur de modification" })
    }

    res.json({
      success: true,
      message: "Contact modifié avec succès",
      contact: updatedContact,
    })
  } catch (error) {
    console.error("Erreur modification contact:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Supprimer un contact (admin)
app.delete("/api/admin/contacts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id)

    if (error) {
      console.error("Erreur suppression contact:", error)
      return res.status(500).json({ error: "Erreur lors de la suppression" })
    }

    res.json({ success: true, message: "Contact supprimé avec succès" })
  } catch (error) {
    console.error("Erreur suppression contact:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Supprimer tous les contacts (admin)
app.delete("/api/admin/contacts", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("contacts").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

    if (error) {
      console.error("Erreur suppression tous contacts:", error)
      return res.status(500).json({ error: "Erreur lors de la suppression" })
    }

    res.json({ success: true, message: "Tous les contacts ont été supprimés" })
  } catch (error) {
    console.error("Erreur suppression tous contacts:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Marquer un message comme lu/non lu
app.patch("/api/admin/messages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { read } = req.body

    const { data: updatedMessage, error } = await supabaseAdmin
      .from("messages")
      .update({
        read: read,
        status: read ? "read" : "new",
      })
      .eq("id", id)
      .select()
      .single()

    if (error || !updatedMessage) {
      return res.status(404).json({ error: "Message non trouvé" })
    }

    res.json({ success: true, message: "Statut mis à jour" })
  } catch (error) {
    console.error("Erreur mise à jour message:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Supprimer un message
app.delete("/api/admin/messages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin.from("messages").delete().eq("id", id)

    if (error) {
      console.error("Erreur suppression message:", error)
      return res.status(500).json({ error: "Erreur lors de la suppression" })
    }

    res.json({ success: true, message: "Message supprimé" })
  } catch (error) {
    console.error("Erreur suppression message:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Télécharger le fichier VCF (admin seulement)
app.get("/api/admin/download/vcf", authenticateToken, async (req, res) => {
  try {
    const vcfContent = await generateVCF()

    if (!vcfContent) {
      return res.status(404).json({ error: "Aucun contact à exporter" })
    }

    // Compter le nombre de contacts
    const { count, error: countError } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true })

    const totalContacts = countError ? 0 : count

    const filename = `ralph_xpert_contacts_${new Date().toISOString().split("T")[0]}.vcf`

    res.setHeader("Content-Type", "text/vcard")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("X-Total-Contacts", totalContacts.toString())

    res.send(vcfContent)
  } catch (error) {
    console.error("Erreur téléchargement VCF:", error)
    res.status(500).json({ error: "Erreur lors du téléchargement" })
  }
})

// Statistiques admin
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    // Récupérer les statistiques des messages
    const { data: messages, error: messagesError } = await supabaseAdmin.from("messages").select("read, timestamp")

    if (messagesError) {
      console.error("Erreur récupération messages pour stats:", messagesError)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    // Récupérer les statistiques des contacts
    const { data: contacts, error: contactsError } = await supabaseAdmin.from("contacts").select("timestamp")

    if (contactsError) {
      console.error("Erreur récupération contacts pour stats:", contactsError)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = {
      totalMessages: messages?.length || 0,
      newMessages: messages?.filter((m) => !m.read).length || 0,
      readMessages: messages?.filter((m) => m.read).length || 0,
      totalContacts: contacts?.length || 0,
      todayMessages:
        messages?.filter((m) => {
          const messageDate = new Date(m.timestamp)
          return messageDate >= today
        }).length || 0,
      todayContacts:
        contacts?.filter((c) => {
          const contactDate = new Date(c.timestamp)
          return contactDate >= today
        }).length || 0,
    }

    res.json({ success: true, stats })
  } catch (error) {
    console.error("Erreur récupération stats:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Rechercher des contacts (public - limité)
app.get("/api/contacts/search", async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Le terme de recherche doit contenir au moins 2 caractères" })
    }

    // Recherche limitée aux 10 derniers contacts pour la sécurité
    const { data: contacts, error } = await supabasePublic
      .from("contacts")
      .select("nom, numero_complet")
      .or(`nom.ilike.%${q}%,numero_complet.ilike.%${q}%`)
      .order("timestamp", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Erreur recherche contacts:", error)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    res.json({
      success: true,
      contacts: contacts || [],
      total: contacts?.length || 0,
    })
  } catch (error) {
    console.error("Erreur recherche contacts:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Route pour servir les fichiers statiques
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Démarrage du serveur
async function startServer() {
  // Vérifier la connexion Supabase
  try {
    const { data, error } = await supabaseAdmin.from("contacts").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Erreur connexion Supabase:", error.message)
      console.log("🔧 Vérifiez vos variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY")
    } else {
      console.log("✅ Connexion Supabase établie")
    }
  } catch (error) {
    console.error("❌ Erreur connexion Supabase:", error.message)
  }

  app.listen(PORT, () => {
    console.log(`🚀 Serveur Ralph Xpert démarré sur http://localhost:${PORT}`)
    console.log(`📊 Admin: http://localhost:${PORT}/admin-login.html`)
    console.log(`🔑 Identifiants: Admin / Admin`)
    console.log(`🗄️  Base de données: Supabase`)
  })
}

startServer()
