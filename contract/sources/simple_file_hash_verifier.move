module file_hash_verifier_addr::complete_file_hash_verifier {
    use std::string::String;
    use std::vector;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // Error codes
    const E_FILE_NOT_FOUND: u64 = 1;
    const E_HASH_MISMATCH: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;

    // File record structure
    struct FileRecord has store, copy, drop {
        file_name: String,
        file_hash: vector<u8>,
        uploader: address,
        timestamp: u64,
        verification_count: u64,
    }

    // Organization record structure
    struct OrganizationRecord has store, copy, drop {
        name: String,
        description: String,
        owner: address,
        timestamp: u64,
        document_count: u64,
    }

    // Education document structure
    struct EducationDocument has store, copy, drop {
        title: String,
        description: String,
        file_hash: vector<u8>,
        organization: String,
        uploader: address,
        timestamp: u64,
    }

    // Simple storage directly on the deployer account
    struct FileHashStorage has key {
        files: vector<FileRecord>,
        organizations: vector<OrganizationRecord>,
        education_documents: vector<EducationDocument>,
    }

    // Events
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

    #[event]
    struct OrganizationRegistered has drop, store {
        name: String,
        description: String,
        owner: address,
        timestamp: u64,
    }

    #[event]
    struct EducationDocumentUploaded has drop, store {
        title: String,
        organization: String,
        file_hash: vector<u8>,
        uploader: address,
        timestamp: u64,
    }

    // Initialize the module - create storage on deployer account
    fun init_module(sender: &signer) {
        move_to(sender, FileHashStorage {
            files: vector::empty<FileRecord>(),
            organizations: vector::empty<OrganizationRecord>(),
            education_documents: vector::empty<EducationDocument>(),
        });
    }

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
        
        // Access storage directly from the module deployer account
        let storage = borrow_global_mut<FileHashStorage>(@file_hash_verifier_addr);
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
        let storage = borrow_global_mut<FileHashStorage>(@file_hash_verifier_addr);
        
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

    /// Register a new organization
    public entry fun register_organization(
        sender: &signer,
        name: String,
        description: String,
    ) acquires FileHashStorage {
        let owner_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        
        let organization = OrganizationRecord {
            name,
            description,
            owner: owner_addr,
            timestamp: current_time,
            document_count: 0,
        };
        
        let storage = borrow_global_mut<FileHashStorage>(@file_hash_verifier_addr);
        vector::push_back(&mut storage.organizations, organization);
        
        // Emit event
        event::emit(OrganizationRegistered {
            name: organization.name,
            description: organization.description,
            owner: owner_addr,
            timestamp: current_time,
        });
    }

    /// Upload an education document
    public entry fun upload_education_document(
        sender: &signer,
        title: String,
        description: String,
        file_hash: vector<u8>,
        organization: String,
    ) acquires FileHashStorage {
        let uploader_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();
        
        let document = EducationDocument {
            title,
            description,
            file_hash,
            organization,
            uploader: uploader_addr,
            timestamp: current_time,
        };
        
        let storage = borrow_global_mut<FileHashStorage>(@file_hash_verifier_addr);
        vector::push_back(&mut storage.education_documents, document);
        
        // Update organization document count
        let orgs = &mut storage.organizations;
        let orgs_len = vector::length(orgs);
        let i = 0;
        while (i < orgs_len) {
            let org = vector::borrow_mut(orgs, i);
            if (org.name == organization) {
                org.document_count = org.document_count + 1;
                break
            };
            i = i + 1;
        };
        
        // Emit event
        event::emit(EducationDocumentUploaded {
            title: document.title,
            organization: document.organization,
            file_hash: document.file_hash,
            uploader: uploader_addr,
            timestamp: current_time,
        });
    }

    #[view]
    /// Get all stored file records
    public fun get_all_files(): vector<FileRecord> acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        storage.files
    }

    #[view]
    /// Get file record by name
    public fun get_file_by_name(file_name: String): FileRecord acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        let files = &storage.files;
        let files_len = vector::length(files);
        let i = 0;
        
        while (i < files_len) {
            let file_record = vector::borrow(files, i);
            if (file_record.file_name == file_name) {
                return *file_record
            };
            i = i + 1;
        };
        
        abort E_FILE_NOT_FOUND
    }

    #[view]
    /// Get total number of files
    public fun get_total_files(): u64 acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        vector::length(&storage.files)
    }

    #[view]
    /// Get all organizations
    public fun get_all_organizations(): vector<OrganizationRecord> acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        storage.organizations
    }

    #[view]
    /// Get all education documents
    public fun get_all_education_documents(): vector<EducationDocument> acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        storage.education_documents
    }

    #[view]
    /// Get education documents by organization
    public fun get_education_documents_by_organization(organization: String): vector<EducationDocument> acquires FileHashStorage {
        let storage = borrow_global<FileHashStorage>(@file_hash_verifier_addr);
        let all_docs = &storage.education_documents;
        let filtered_docs = vector::empty<EducationDocument>();
        let docs_len = vector::length(all_docs);
        let i = 0;
        
        while (i < docs_len) {
            let doc = vector::borrow(all_docs, i);
            if (doc.organization == organization) {
                vector::push_back(&mut filtered_docs, *doc);
            };
            i = i + 1;
        };
        
        filtered_docs
    }

    // Internal helper function for verification
    fun verify_file_internal(
        files: &mut vector<FileRecord>,
        file_name: String,
        file_hash: vector<u8>
    ): (bool, bool) {
        let files_len = vector::length(files);
        let i = 0;
        
        while (i < files_len) {
            let file_record = vector::borrow_mut(files, i);
            if (file_record.file_name == file_name) {
                file_record.verification_count = file_record.verification_count + 1;
                let is_valid = file_record.file_hash == file_hash;
                return (true, is_valid)
            };
            i = i + 1;
        };
        
        (false, false)
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}
