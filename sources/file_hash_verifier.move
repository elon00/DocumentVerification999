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

    // File record structure
    struct FileRecord has store, copy, drop {
        file_name: String,
        file_hash: vector<u8>,
        uploader: address,
        timestamp: u64,
        verification_count: u64,
    }

    // Main storage for file records
    struct FileHashStorage has key {
        files: vector<FileRecord>,
    }

    const STORAGE_OBJECT_SEED: vector<u8> = b"file_hash_storage";

    struct StorageObjectController has key {
        extend_ref: ExtendRef,
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

    // Initialize the module
    fun init_module(sender: &signer) {
        let constructor_ref = &object::create_named_object(sender, STORAGE_OBJECT_SEED);
        let storage_signer = &object::generate_signer(constructor_ref);
        
        move_to(storage_signer, StorageObjectController {
            extend_ref: object::generate_extend_ref(constructor_ref),
        });
        
        move_to(storage_signer, FileHashStorage {
            files: vector::empty<FileRecord>(),
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
