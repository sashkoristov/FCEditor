package persistence;

import java.io.*;
import java.util.Collection;
import java.util.HashMap;

public abstract class FileBasedRepository<T extends DomainObject> implements Repository<T> {

    protected HashMap<String, T> db;
    protected String filePath;

    public FileBasedRepository(String filePath) {
        this.filePath = filePath;
        db = new HashMap<String, T>();
        try {
            File dbFile = new File(filePath);
            dbFile.createNewFile();
        } catch (Exception e) {
            e.printStackTrace();
        }
        load();
    }

    protected void save() {
        try {
            FileOutputStream fout = new FileOutputStream(filePath);
            ObjectOutputStream oos = new ObjectOutputStream(fout);
            oos.writeObject(db);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void load() {
        try {
            FileInputStream fin = new FileInputStream(filePath);
            ObjectInputStream ois = new ObjectInputStream(fin);
            Object obj = ois.readObject();
            if (obj instanceof HashMap) {
                this.db = (HashMap<String, T>) obj;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<T> findAll() {
        return db.values();
    }

    @Override
    public void add(T newObj) {
        db.put(newObj.id, newObj);
        save();
    }

    @Override
    public void remove(T obj) {
        db.remove(obj.id);
        save();
    }

    @Override
    public void remove(String id) {
        db.remove(id);
        save();
    }

    @Override
    public boolean has(String id) {
        return db.containsKey(id);
    }
}
