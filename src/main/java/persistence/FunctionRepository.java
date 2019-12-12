package persistence;

import java.io.*;
import java.util.Collection;
import java.util.HashMap;

public class FunctionRepository implements Repository<Function> {

    private HashMap<String, Function> db;

    public FunctionRepository() {
        db = new HashMap<String, Function>();
        try {
            File dbFile = new File("functions.ser");
            dbFile.createNewFile();
        } catch (Exception e) {
            e.printStackTrace();
        }
        load();
    }

    @Override
    public Collection<Function> findAll() {
        return db.values();
    }

    @Override
    public void add(Function newObj) {
        db.put(newObj.id, newObj);
        save();
    }

    @Override
    public void remove(Function obj) {
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

    private void save() {
        try {
            FileOutputStream fout = new FileOutputStream("functions.ser");
            ObjectOutputStream oos = new ObjectOutputStream(fout);
            oos.writeObject(db);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void load() {
        try {
            FileInputStream fin = new FileInputStream("functions.ser");
            ObjectInputStream ois = new ObjectInputStream(fin);
            Object obj = ois.readObject();
            if (obj instanceof HashMap) {
                this.db = (HashMap<String, Function>) obj;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
