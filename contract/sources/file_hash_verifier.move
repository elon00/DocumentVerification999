module file_hash_verifier_addr::file_hash_verifier {
    use std::string::String;
    use std::vector;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::event;

    // Error codes
    const E_FILE_NOT_FOUND: u64 = 1;
    const E_HASH_MISMATCH: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_ORGANIZATION_NOT_FOUND: u64 = 4;
    const E_ORGANIZATION_EXISTS: u64 = 5;
    const E_DOCUMENT_NOT_FOUND: u64 = 6;

    // Organization structure
    struct Organization has store, copy, drop {
        id: String,
        name: String,
        description: String,
        wallet_address: address,
        created_at: u64,
        website_url: String,
        contact_email: String,
        accreditation: String,
        established_year: u64,
        document_count: u64,
        is_verified: bool,
    }

    // Educational Document structure
    struct EducationDocument has store, copy, drop {
        id: String,
        title: String,
        description: String,
        category: String,
        subject: String,
        grade: String,
        instructor: String,
        organization_id: String,
        organization_name: String,
        file_name: String,
        file_size: u64,
        file_hash: vector<u8>,
        upload_date: u64,
        tags: vector<String>,
        uploader: address,
        certificate_number: String,
        credits_earned: u64,
        gpa: String,
        expiry_date: u64,
        qr_code_data: String,
    }

    // File record structure (legacy - keeping for compatibility)
    struct FileRecord has store, copy, drop {
        file_name: String,
        file_hash: vector<u8>,
        uploader: address,
        timestamp: u64,
        verification_count: u64,
    }

    // Main storage for organizations
    struct OrganizationStorage has key {
        organizations: vector<Organization>,
    }

    // Main storage for educational documents
    struct DocumentStorage has key {
        documents: vector<EducationDocument>,
    }

    // Main storage for file records (legacy)
    struct FileHashStorage has key {
        files: vector<FileRecord>,
    }

    const STORAGE_OBJECT_SEED: vector<u8> = b"file_hash_storage";

    struct StorageObjectController has key {
        extend_ref: ExtendRef,
    }

    // Events
    #[event]
    struct OrganizationRegistered has drop, store {
        id: String,
        name: String,
        wallet_address: address,
        timestamp: u64,
    }

    #[event]
    struct DocumentUploaded has drop, store {
        id: String,
        title: String,
        organization_id: String,
        uploader: address,
        file_hash: vector<u8>,
        timestamp: u64,
    }

    #[event]
    struct FileHashStored has drop, store {
        file_name: String,
        file_hash: vector<u8>,
        uploader: address,
        timestamp: u64,
    }

    #[event]
    struct FileHashVerified has drop, store {
        file_name: String,
        file_hash: vector<u8>,
        verifier: address,
        timestamp: u64,
        is_valid: bool,
    }

    // Initialize the module
    fun init_module(sender: &signer) {
        let constructor_ref = &object::create_named_object(sender, STORAGE_OBJECT_SEED);
        let storage_signer = &object::generate_signer(constructor_ref);
        
        move_to(storage_signer, StorageObjectController {
            extend_ref: object::generate_extend_ref(constructor_ref),
        });
        
        // Initialize all storage structures
        move_to(storage_signer, FileHashStorage {
            files: vector::empty<FileRecord>(),
        });
        
        move_to(storage_signer, OrganizationStorage {
            organizations: vector::empty<Organization>(),
        });
        
        move_to(storage_signer, DocumentStorage {
            documents: vector::empty<EducationDocument>(),
        });
    }

    // ======================== Write functions ========================

    /// Store a file hash on the blockchain
    public entry fun store_file_hash(
        sender: &signer,
        file_name: String,
        file_hash: vector<u8>,
    ) acquires FileHashStorage {
        let uploader_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        
        let file_record = FileRecord {
            file_name,
            file_hash,
            uploader: uploader_addr,
            timestamp: current_time,
            verification_count: 0,
        };
        
        let storage = borrow_global_mut<FileHashStorage>(get_storage_obj_address());
        vector::push_back(&mut storage.files, file_record);
        
        // Emit event
        event::emit(FileHashStored {
            file_name: file_record.file_name,
            file_hash: file_record.file_hash,
            uploader: uploader_addr,
            timestamp: current_time,
        });
    }

    /// Verify a file hash against stored records
    public entry fun verify_file_hash(
        sender: &signer,
        file_name: String,
        file_hash: vector<u8>,
    ) acquires FileHashStorage {
        let verifier_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        let storage = borrow_global_mut<FileHashStorage>(get_storage_obj_address());
        
        let (found, is_valid) = verify_file_internal(&mut storage.files, file_name, file_hash);
        assert!(found, E_FILE_NOT_FOUND);
        
        // Emit verification event
        event::emit(FileHashVerified {
            file_name,
            file_hash,
            verifier: verifier_addr,
            timestamp: current_time,
            is_valid,
        });
    }

    /// Register a new organization on the blockchain
    public entry fun register_organization(
        sender: &signer,
        id: String,
        name: String,
        description: String,
        website_url: String,
        contact_email: String,
        accreditation: String,
        established_year: u64,
    ) acquires OrganizationStorage {
        let wallet_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        
        // Check if organization already exists for this wallet
        let storage = borrow_global_mut<OrganizationStorage>(get_storage_obj_address());
        let orgs_len = vector::length(&storage.organizations);
        let i = 0;
        
        while (i < orgs_len) {
            let org = vector::borrow(&storage.organizations, i);
            assert!(org.wallet_address != wallet_addr, E_ORGANIZATION_EXISTS);
            i = i + 1;
        };
        
        let organization = Organization {
            id,
            name,
            description,
            wallet_address: wallet_addr,
            created_at: current_time,
            website_url,
            contact_email,
            accreditation,
            established_year,
            document_count: 0,
            is_verified: false,
        };
        
        vector::push_back(&mut storage.organizations, organization);
        
        // Emit event
        event::emit(OrganizationRegistered {
            id: organization.id,
            name: organization.name,
            wallet_address: wallet_addr,
            timestamp: current_time,
        });
    }

    /// Upload an educational document to the blockchain
    public entry fun upload_education_document(
        sender: &signer,
        id: String,
        title: String,
        description: String,
        category: String,
        subject: String,
        grade: String,
        instructor: String,
        organization_id: String,
        organization_name: String,
        file_name: String,
        file_size: u64,
        file_hash: vector<u8>,
        tags: vector<String>,
        certificate_number: String,
        credits_earned: u64,
        gpa: String,
        expiry_date: u64,
        qr_code_data: String,
    ) acquires DocumentStorage, OrganizationStorage {
        let uploader_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        
        let document = EducationDocument {
            id,
            title,
            description,
            category,
            subject,
            grade,
            instructor,
            organization_id,
            organization_name,
            file_name,
            file_size,
            file_hash,
            upload_date: current_time,
            tags,
            uploader: uploader_addr,
            certificate_number,
            credits_earned,
            gpa,
            expiry_date,
            qr_code_data,
        };
        
        let doc_storage = borrow_global_mut<DocumentStorage>(get_storage_obj_address());
        vector::push_back(&mut doc_storage.documents, document);
        
        // Update organization document count
        let org_storage = borrow_global_mut<OrganizationStorage>(get_storage_obj_address());
        let orgs_len = vector::length(&org_storage.organizations);
        let i = 0;
        
        while (i < orgs_len) {
            let org = vector::borrow_mut(&mut org_storage.organizations, i);
            if (org.id == organization_id) {
                org.document_count = org.document_count + 1;
                break
            };
            i = i + 1;
        };
        
        // Emit event
        event::emit(DocumentUploaded {
            id: document.id,
            title: document.title,
            organization_id: document.organization_id,
            uploader: uploader_addr,
            file_hash: document.file_hash,
            timestamp: current_time,
        });
    }

    // ======================== View Functions ========================

    #[view]
    /// Get all stored file records
    public fun get_all_files(): vector<FileRecord> acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(get_storage_obj_address());
        storage.files
    }

    #[view]
    /// Get file record by name
    public fun get_file_by_name(file_name: String): FileRecord acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(get_storage_obj_address());
        let files_len = vector::length(&storage.files);
        let i = 0;
        
        while (i < files_len) {
            let file_record = vector::borrow(&storage.files, i);
            if (file_record.file_name == file_name) {
                return *file_record
            };
            i = i + 1;
        };
        
        abort E_FILE_NOT_FOUND
    }

    #[view]
    /// Check if a file exists
    public fun file_exists(file_name: String): bool acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(get_storage_obj_address());
        find_file_index(&storage.files, file_name) < vector::length(&storage.files)
    }

    #[view]
    /// Get total number of files stored
    public fun get_total_files(): u64 acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(get_storage_obj_address());
        vector::length(&storage.files)
    }

    #[view]
    /// Get all organizations
    public fun get_all_organizations(): vector<Organization> acquires OrganizationStorage {
        let storage = borrow_global<OrganizationStorage>(get_storage_obj_address());
        storage.organizations
    }

    #[view]
    /// Get organization by wallet address
    public fun get_organization_by_wallet(wallet_address: address): Organization acquires OrganizationStorage {
        let storage = borrow_global<OrganizationStorage>(get_storage_obj_address());
        let orgs_len = vector::length(&storage.organizations);
        let i = 0;
        
        while (i < orgs_len) {
            let org = vector::borrow(&storage.organizations, i);
            if (org.wallet_address == wallet_address) {
                return *org
            };
            i = i + 1;
        };
        
        abort E_ORGANIZATION_NOT_FOUND
    }

    #[view]
    /// Get organization by ID
    public fun get_organization_by_id(id: String): Organization acquires OrganizationStorage {
        let storage = borrow_global<OrganizationStorage>(get_storage_obj_address());
        let orgs_len = vector::length(&storage.organizations);
        let i = 0;
        
        while (i < orgs_len) {
            let org = vector::borrow(&storage.organizations, i);
            if (org.id == id) {
                return *org
            };
            i = i + 1;
        };
        
        abort E_ORGANIZATION_NOT_FOUND
    }

    #[view]
    /// Check if organization exists for wallet
    public fun organization_exists_for_wallet(wallet_address: address): bool acquires OrganizationStorage {
        let storage = borrow_global<OrganizationStorage>(get_storage_obj_address());
        let orgs_len = vector::length(&storage.organizations);
        let i = 0;
        
        while (i < orgs_len) {
            let org = vector::borrow(&storage.organizations, i);
            if (org.wallet_address == wallet_address) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    #[view]
    /// Get all education documents
    public fun get_all_education_documents(): vector<EducationDocument> acquires DocumentStorage {
        let storage = borrow_global<DocumentStorage>(get_storage_obj_address());
        storage.documents
    }

    #[view]
    /// Get documents by organization ID
    public fun get_documents_by_organization(organization_id: String): vector<EducationDocument> acquires DocumentStorage {
        let storage = borrow_global<DocumentStorage>(get_storage_obj_address());
        let all_docs = &storage.documents;
        let filtered_docs = vector::empty<EducationDocument>();
        let docs_len = vector::length(all_docs);
        let i = 0;
        
        while (i < docs_len) {
            let doc = vector::borrow(all_docs, i);
            if (doc.organization_id == organization_id) {
                vector::push_back(&mut filtered_docs, *doc);
            };
            i = i + 1;
        };
        
        filtered_docs
    }

    #[view]
    /// Get documents by wallet address
    public fun get_documents_by_wallet(wallet_address: address): vector<EducationDocument> acquires DocumentStorage {
        let storage = borrow_global<DocumentStorage>(get_storage_obj_address());
        let all_docs = &storage.documents;
        let filtered_docs = vector::empty<EducationDocument>();
        let docs_len = vector::length(all_docs);
        let i = 0;
        
        while (i < docs_len) {
            let doc = vector::borrow(all_docs, i);
            if (doc.uploader == wallet_address) {
                vector::push_back(&mut filtered_docs, *doc);
            };
            i = i + 1;
        };
        
        filtered_docs
    }

    #[view]
    /// Get document by ID
    public fun get_document_by_id(id: String): EducationDocument acquires DocumentStorage {
        let storage = borrow_global<DocumentStorage>(get_storage_obj_address());
        let docs_len = vector::length(&storage.documents);
        let i = 0;
        
        while (i < docs_len) {
            let doc = vector::borrow(&storage.documents, i);
            if (doc.id == id) {
                return *doc
            };
            i = i + 1;
        };
        
        abort E_DOCUMENT_NOT_FOUND
    }

    #[view]
    /// Get total number of organizations
    public fun get_total_organizations(): u64 acquires OrganizationStorage {
        let storage = borrow_global<OrganizationStorage>(get_storage_obj_address());
        vector::length(&storage.organizations)
    }

    #[view]
    /// Get total number of education documents
    public fun get_total_education_documents(): u64 acquires DocumentStorage {
        let storage = borrow_global<DocumentStorage>(get_storage_obj_address());
        vector::length(&storage.documents)
    }

    // ======================== Helper Functions ========================

    fun verify_file_internal(files: &mut vector<FileRecord>, file_name: String, file_hash: vector<u8>): (bool, bool) {
        let files_len = vector::length(files);
        let i = 0;
        
        while (i < files_len) {
            let file_record = vector::borrow_mut(files, i);
            if (file_record.file_name == file_name) {
                file_record.verification_count = file_record.verification_count + 1;
                return (true, file_record.file_hash == file_hash)
            };
            i = i + 1;
        };
        
        (false, false)
    }

    fun find_file_index(files: &vector<FileRecord>, file_name: String): u64 {
        let files_len = vector::length(files);
        let i = 0;
        
        while (i < files_len) {
            let file_record = vector::borrow(files, i);
            if (file_record.file_name == file_name) {
                return i
            };
            i = i + 1;
        };
        
        files_len
    }

    fun get_storage_obj_address(): address {
        object::create_object_address(&@file_hash_verifier_addr, STORAGE_OBJECT_SEED)
    }

    fun get_storage_obj_signer(): signer acquires StorageObjectController {
        let storage_obj_controller = borrow_global<StorageObjectController>(get_storage_obj_address());
        object::generate_signer_for_extending(&storage_obj_controller.extend_ref)
    }

    // ======================== Unit Tests ========================

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}
